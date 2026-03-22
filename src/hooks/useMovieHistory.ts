import { useState, useEffect } from 'react'
import type { TMDBMovie } from '@/lib/tmdb'

export type RatedMovie = TMDBMovie & { score: number }

export function useMovieHistory() {
  const [history, setHistoryState] = useState<RatedMovie[]>(() => {
    const saved = localStorage.getItem('movie_history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return []
      }
    }
    return []
  })

  const [watchLater, setWatchLaterState] = useState<TMDBMovie[]>(() => {
    const saved = localStorage.getItem('movie_watch_later')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return []
      }
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('movie_history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('movie_watch_later', JSON.stringify(watchLater))
  }, [watchLater])

  const addToHistory = (movie: TMDBMovie, score: number) => {
    setHistoryState(prev => {
      // Don't add duplicate
      if (prev.some(m => m.id === movie.id)) return prev
      return [{ ...movie, score }, ...prev]
    })
  }

  const addToWatchLater = (movie: TMDBMovie) => {
    setWatchLaterState(prev => {
      // Don't add duplicate
      if (prev.some(m => m.id === movie.id)) return prev
      return [movie, ...prev]
    })
  }

  return { history, addToHistory, watchLater, addToWatchLater }
}
