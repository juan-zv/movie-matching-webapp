import { useState, useRef, useCallback } from 'react'
import { MovieCard } from '@/components/MovieCard'
import { MovieCardSkeleton } from '@/components/skeletons/MovieCardSkeleton'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { usePopularMovies, useSearchMovies } from '@/hooks/useMovies'
import { useDebounce } from '@/hooks/useDebounce'
import type { TMDBMovie } from '@/lib/tmdb'

export function MoviesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const isSearching = debouncedSearchTerm.length > 0
  const popularQuery = usePopularMovies()
  const searchQuery = useSearchMovies(debouncedSearchTerm)

  const currentQuery = isSearching ? searchQuery : popularQuery
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = currentQuery

  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [fourStarMovies, setFourStarMovies] = useState<TMDBMovie[]>([])

  const observerRef = useRef<IntersectionObserver | null>(null)
  
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingNextPage || !hasNextPage) return
    
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    }, { threshold: 0.1 })
    
    if (node) observerRef.current.observe(node)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  const allMovies = data?.pages.flatMap((page) => page.results) || []

  const handleRate = (movieId: number, rating: number) => {
    setRatings((prev) => {
      const newRatings = { ...prev, [movieId]: rating }
      
      const movie = allMovies.find((m) => m.id === movieId)
      if (rating === 4 && movie) {
        setFourStarMovies((prevM) => {
          if (!prevM.find((m) => m.id === movieId)) {
            return [...prevM, movie]
          }
          return prevM
        })
      } else {
        setFourStarMovies((prevM) => prevM.filter((m) => m.id !== movieId))
      }
      
      return newRatings
    })
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <p className="text-sm font-medium text-slate-700">Loading movies from TMDB...</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        Error loading movies: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="relative max-w-xl mx-auto">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Input
          type="text"
          className="pl-10 h-12 text-lg shadow-sm"
          placeholder="Search for movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isSearching && allMovies.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          No movies found for "{searchTerm}"
        </div>
      )}

      {fourStarMovies.length > 0 && !isSearching && (
        <div className="rounded-lg bg-yellow-50 p-4">
          <h2 className="mb-2 font-semibold text-yellow-800">
            ⭐ Your 4-Star Rated Movies ({fourStarMovies.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {fourStarMovies.map((movie) => (
              <span
                key={movie.id}
                className="rounded-full bg-yellow-200 px-3 py-1 text-sm text-yellow-800"
              >
                {movie.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allMovies.map((movie, idx) => (
          <MovieCard
            key={`${movie.id}-${idx}`}
            movie={movie}
            userRating={ratings[movie.id] ?? null}
            onRate={handleRate}
          />
        ))}
      </div>
      
      {/* Infinite scroll sentinel */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex flex-col items-center justify-center gap-2 py-8">
          {isFetchingNextPage ? (
            <>
              <Progress value={66} className="w-32" />
              <p className="text-sm text-slate-500">Loading more movies...</p>
            </>
          ) : (
            <div className="h-10 w-full" />
          )}
        </div>
      )}
    </div>
  )
}
