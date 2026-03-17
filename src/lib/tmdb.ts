export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
}

interface TMDBResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

const getHeaders = () => {
  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN
  if (!token) {
    console.warn("Missing VITE_TMDB_ACCESS_TOKEN in environment variables.")
  }
  return {
    accept: "application/json",
    Authorization: `Bearer ${token}`
  }
}

export const fetchPopularMovies = async (page: number = 1): Promise<TMDBResponse> => {
  const response = await fetch(`${TMDB_BASE_URL}/movie/popular?language=en-US&page=${page}`, {
    method: "GET",
    headers: getHeaders()
  })
  
  if (!response.ok) {
    throw new Error("Failed to fetch popular movies")
  }
  
  return response.json()
}

export const searchMovies = async (query: string, page: number = 1): Promise<TMDBResponse> => {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`,
    {
      method: "GET",
      headers: getHeaders()
    }
  )

  if (!response.ok) {
    throw new Error("Failed to search movies")
  }

  return response.json()
}

export const getImageUrl = (path: string | null, size: "w500" | "original" = "w500") => {
  if (!path) return "/placeholder-movie.png" // Fallback local image or generic URL
  return `https://image.tmdb.org/t/p/${size}${path}`
}
