import { useState, useEffect } from 'react'
import { SwipeDeck } from '@/components/SwipeDeck'
import { usePopularMovies } from '@/hooks/useMovies'
import { useMovieHistory } from '@/hooks/useMovieHistory'
import { type TMDBMovie } from '@/lib/tmdb'

export function HomePage() {
  const { data, isLoading, fetchNextPage, hasNextPage } = usePopularMovies()
  const { history, addToHistory, watchLater, addToWatchLater } = useMovieHistory()
  const [movieQueue, setMovieQueue] = useState<TMDBMovie[]>([])

  // Initialize and append to queue when data updates
  useEffect(() => {
    if (data?.pages) {
      const allMovies = data.pages.flatMap(p => p.results)
      // Only keep movies we haven't seen in history or watch later
      const unseenMovies = allMovies.filter(m => 
        !history.some(h => h.id === m.id) && 
        !watchLater.some(w => w.id === m.id)
      )
      setMovieQueue(unseenMovies)
    }
  }, [data, history, watchLater])

  // Fetch more logic if queue runs low
  useEffect(() => {
    if (movieQueue.length < 3 && hasNextPage) {
      fetchNextPage()
    }
  }, [movieQueue.length, hasNextPage, fetchNextPage])

  const handleRate = (movie: TMDBMovie, score: number) => {
    addToHistory(movie, score)
    setMovieQueue(prev => prev.slice(1)) // Remove first item
  }

  const handleSkip = (movie: TMDBMovie) => {
    // Record as 0 score so it is added to history but can be ignored in UI
    addToHistory(movie, 0)
    setMovieQueue(prev => prev.slice(1)) // Remove first item
  }

  const handleWatchLater = (movie: TMDBMovie) => {
    addToWatchLater(movie)
    setMovieQueue(prev => prev.slice(1)) // Remove first item, you might want to save it somewhere
  }

  return (
    <div className="w-full min-h-[85vh] flex flex-col pt-4 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col px-4 pb-20">
        {isLoading && movieQueue.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground animate-pulse text-lg">Loading movies...</p>
          </div>
        ) : (
          <SwipeDeck 
            movies={movieQueue} 
            onRate={handleRate} 
            onSkip={handleSkip} 
            onWatchLater={handleWatchLater}
          />
        )}
      </div>
    </div>
  )
}
