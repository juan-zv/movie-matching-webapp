import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { TMDBMovie } from '@/lib/tmdb'

export type RatedMovie = TMDBMovie & { score: number }

export function useMovieHistory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch history (rated and skipped movies)
  const { data: history = [] } = useQuery({
    queryKey: ['interactions', 'history', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('user_interactions')
        .select(`
          rating,
          movies (*)
        `)
        .eq('user_id', user.id)
        .in('action_type', ['rate', 'skip'])
        .order('created_at', { ascending: false })
        
      if (error) {
        console.error(error)
        throw error
      }
      
      // Filter out null movies in case relation fails, map to RatedMovie
      return (data
        .filter(row => row.movies !== null)
        .map(row => {
          const rowMovies = row.movies as any;
          return {
            ...rowMovies, // This spreads the TMDB data cached in the DB
            id: rowMovies.tmdb_id, // ensure id matches TMDBMovie expected id
            score: row.rating || 0
          }
        })) as unknown as RatedMovie[]
    },
    enabled: !!user
  })

  // Fetch watch later
  const { data: watchLater = [] } = useQuery({
    queryKey: ['interactions', 'watchlist', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('user_interactions')
        .select(`
          movies (*)
        `)
        .eq('user_id', user.id)
        .eq('action_type', 'watchlist')
        .order('created_at', { ascending: false })
        
      if (error) {
        console.error(error)
        throw error
      }
      
      return (data
        .filter(row => row.movies !== null)
        .map(row => {
          const rowMovies = row.movies as any;
          return {
            ...rowMovies,
            id: rowMovies.tmdb_id
          }
        })) as unknown as TMDBMovie[]
    },
    enabled: !!user
  })

  const addInteraction = useMutation({
    mutationFn: async ({ movie, score, actionType }: { movie: TMDBMovie, score?: number, actionType: 'rate' | 'skip' | 'watchlist' }) => {
      if (!user) throw new Error("Not logged in")

      // 1. Cache the movie data to ensure the foreign key in user_interactions resolves!
      const { error: movieError } = await supabase.from('movies').upsert({
        tmdb_id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        genre_ids: movie.genre_ids,
        release_date: movie.release_date || null
      }, { onConflict: 'tmdb_id' })
      
      if (movieError) {
        console.warn("Could not cache movie: ", movieError)
      }

      // 2. Insert interaction
      const { error } = await supabase.from('user_interactions').insert({
        user_id: user.id,
        tmdb_id: movie.id,
        rating: score || null,
        action_type: actionType
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
    }
  })

  const addToHistory = (movie: TMDBMovie, score: number) => {
    addInteraction.mutate({ 
      movie, 
      score, 
      actionType: score > 0 ? 'rate' : 'skip' 
    })
  }

  const addToWatchLater = (movie: TMDBMovie) => {
    addInteraction.mutate({ 
      movie, 
      actionType: 'watchlist' 
    })
  }

  return { history, addToHistory, watchLater, addToWatchLater }
}
