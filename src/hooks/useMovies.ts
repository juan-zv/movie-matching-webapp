import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchPopularMovies, searchMovies, fetchTopRatedMovies, fetchDiscoverMovies } from "@/lib/tmdb"
import { useAuth } from "@/contexts/AuthContext"

export function useRecommendedMovies() {
  const { profile } = useAuth()
  
  // Calculate top 3 genres from genre_weights tracking in the DB profile
  let topGenreIds: number[] = []
  if (profile?.genre_weights) {
    const weights = profile.genre_weights as Record<string, number>
    topGenreIds = Object.entries(weights)
      .sort((a, b) => b[1] - a[1]) // highest weights first
      .slice(0, 3) 
      .map(entry => parseInt(entry[0], 10))
  }

  return useInfiniteQuery({
    queryKey: ["movies", "recommended", topGenreIds.join(',')],
    queryFn: ({ pageParam = 1 }) => 
      topGenreIds.length > 0 
        ? fetchDiscoverMovies(topGenreIds, pageParam) 
        : fetchPopularMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
  })
}

export function useTopRatedMovies() {
  return useInfiniteQuery({
    queryKey: ["movies", "top_rated"],
    queryFn: ({ pageParam = 1 }) => fetchTopRatedMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
  })
}

export function usePopularMovies() {
  return useInfiniteQuery({
    queryKey: ["movies", "popular"],
    queryFn: ({ pageParam = 1 }) => fetchPopularMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
  })
}

export function useSearchMovies(query: string) {
  return useInfiniteQuery({
    queryKey: ["movies", "search", query],
    queryFn: ({ pageParam = 1 }) => searchMovies(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
    enabled: query.length > 0, // only run if there is a query
  })
}
