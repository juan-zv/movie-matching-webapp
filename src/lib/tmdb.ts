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

export const fetchTopRatedMovies = async (page: number = 1): Promise<TMDBResponse> => {
  const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?language=en-US&page=${page}&region=US`, {
    method: "GET",
    headers: getHeaders()
  })
  
  if (!response.ok) {
    throw new Error("Failed to fetch top rated movies")
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

export const fetchDiscoverMovies = async (genreIds: number[], page: number = 1): Promise<TMDBResponse> => {
  const genreQuery = genreIds.length > 0 ? `&with_genres=${genreIds.join(',')}` : '';
  const response = await fetch(`${TMDB_BASE_URL}/discover/movie?language=en-US&sort_by=popularity.desc&page=${page}${genreQuery}`, {
    method: "GET",
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error("Failed to fetch discover movies")
  }

  return response.json()
}

export const getImageUrl = (path: string | null, size: "w500" | "original" = "w500") => {
  if (!path) return "/placeholder-movie.png" // Fallback local image or generic URL
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export const GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
}
