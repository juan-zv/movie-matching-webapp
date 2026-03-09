import { useEffect, useState, useRef, useCallback } from 'react'
import { MovieCard } from '../components/MovieCard'
import { parseCSV, type Movie } from '@/lib/parseCSV'
import { Progress } from '../components/ui/progress'

const MOVIES_PER_PAGE = 12

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [fourStarMovies, setFourStarMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < movies.length) {
        setLoadingMore(true)
        // Simulate a small delay for smoother UX
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + MOVIES_PER_PAGE, movies.length))
          setLoadingMore(false)
        }, 300)
      }
    }, { threshold: 0.1 })
    
    if (node) {
      observerRef.current.observe(node)
    }
  }, [loading, visibleCount, movies.length])

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoadProgress(10)
        const response = await fetch('/tmdb_5000_movies.csv')
        setLoadProgress(30)
        if (!response.ok) {
          throw new Error('Failed to fetch movies')
        }
        setLoadProgress(50)
        const csvText = await response.text()
        setLoadProgress(70)
        const parsedMovies = parseCSV(csvText)
        setLoadProgress(90)
        setMovies(parsedMovies)
        setLoadProgress(100)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const handleRate = (movieId: number, rating: number) => {
    setRatings((prev) => {
      const newRatings = { ...prev, [movieId]: rating }
      
      // Update four-star movies list
      const movie = movies.find((m) => m.id === movieId)
      if (rating === 4 && movie) {
        setFourStarMovies((prev) => {
          if (!prev.find((m) => m.id === movieId)) {
            return [...prev, movie]
          }
          return prev
        })
      } else {
        setFourStarMovies((prev) => prev.filter((m) => m.id !== movieId))
      }
      
      return newRatings
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-sm font-medium text-slate-700">Loading movies...</p>
        <Progress value={loadProgress} className="w-64" />
        <p className="text-xs text-slate-500">{loadProgress}%</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        Error loading movies: {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {fourStarMovies.length > 0 && (
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
        {movies.slice(0, visibleCount).map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            userRating={ratings[movie.id] ?? null}
            onRate={handleRate}
          />
        ))}
      </div>
      
      {/* Infinite scroll sentinel */}
      {visibleCount < movies.length && (
        <div ref={loadMoreRef} className="flex flex-col items-center justify-center gap-2 py-8">
          {loadingMore ? (
            <>
              <Progress value={66} className="w-32" />
              <p className="text-xs text-slate-400">Loading more...</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Scroll for more...</p>
          )}
        </div>
      )}
      
      <p className="text-center text-sm text-slate-500">
        Showing {Math.min(visibleCount, movies.length)} of {movies.length} movies
      </p>
    </div>
  )
}
