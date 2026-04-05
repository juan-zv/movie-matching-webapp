import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useTopRatedMovies } from '@/hooks/useMovies'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MovieCardSkeleton } from '@/components/skeletons/MovieCardSkeleton'
import type { TMDBMovie } from '@/lib/tmdb'
import { getImageUrl } from '@/lib/tmdb'

function SimpleStarRating({ rating, onRate }: { rating: number | null; onRate: (rating: number) => void }) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating ?? rating ?? 0) >= star
        return (
          <button
            key={star}
            type="button"
            className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            onClick={() => onRate(star)}
          >
            <svg
              className={`h-7 w-7 transition-colors duration-200 ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-muted-foreground/30'}`}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

function SimpleMovieCard({ movie, userRating, onRate }: { movie: TMDBMovie, userRating: number | null, onRate: (id: number, r: number) => void }) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null
  
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm group">
      <div className="relative w-full aspect-[2/3] bg-muted overflow-hidden">
        {movie.poster_path ? (
          <img 
            src={getImageUrl(movie.poster_path)} 
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">No Poster</div>
        )}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-base line-clamp-1 leading-tight" title={movie.title}>{movie.title}</h3>
        <p className="text-xs text-muted-foreground mt-1.5 mb-3">{year} • ⭐ {movie.vote_average.toFixed(1)}</p>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{movie.overview}</p>
        <div className="mt-auto pt-2">
          <SimpleStarRating rating={userRating} onRate={(r) => onRate(movie.id, r)} />
        </div>
      </div>
    </div>
  )
}

interface Step3RateMoviesProps {
  onComplete: () => void;
}

export function Step3RateMovies({ onComplete }: Step3RateMoviesProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [ratings, setRatings] = useState<Record<number, number>>({})
  
  const { data, isLoading } = useTopRatedMovies()
  const movies = data?.pages[0]?.results?.slice(0, 12) || []

  const handleRate = (movieId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [movieId]: rating }))
  }

  const onSubmit = async () => {
    if (Object.keys(ratings).length < 5) return
    if (!user) return
    setLoading(true)
    
    try {
      // 1. Get the newly rated movies and map them to db schema
      const ratedMovies = movies.filter((m: TMDBMovie) => ratings[m.id] !== undefined)
      
      const moviesData = ratedMovies.map((m: TMDBMovie) => ({
        tmdb_id: m.id,
        title: m.title,
        overview: m.overview,
        poster_path: m.poster_path,
        genre_ids: m.genre_ids,
        release_date: m.release_date || null
      }))
      
      // 2. Cache movies so foreign-keys in user_interactions work
      await supabase.from('movies').upsert(moviesData, { onConflict: 'tmdb_id' })

      // 3. Batch insert the ratings into user_interactions
      const interactionsData = ratedMovies.map((m: TMDBMovie) => ({
        user_id: user.id,
        tmdb_id: m.id,
        rating: ratings[m.id],
        action_type: 'rate'
      }))
      
      await supabase.from('user_interactions').insert(interactionsData)

      // 4. Mark onboarding completed
      const { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        onboarding_step: 3, 
        onboarding_completed: true,
      })
      
      if (!error) {
        onComplete()
      } else {
        console.error("Error setting onboarding complete", error)
      }
    } catch (err) {
      console.error("Batch rating insert failed: ", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-center font-bold text-2xl">Step 3: Rate Movies</CardTitle>
        <CardDescription className="text-center text-base mt-2">
          Please rate at least 5 of these popular movies to help us understand your taste.
          <span className="block mt-4 text-sm font-semibold p-2 bg-secondary text-secondary-foreground rounded-lg max-w-50 mx-auto">
            Rated: {Object.keys(ratings).length} / 5
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-4 w-full">
            <p className="text-sm font-medium text-foreground mb-4">Loading top movies...</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {movies.map((movie: TMDBMovie) => (
              <SimpleMovieCard 
                key={movie.id} 
                movie={movie} 
                userRating={ratings[movie.id] || null} 
                onRate={handleRate} 
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t py-6 bg-card sticky bottom-0">
        <Button 
          size="lg"
          disabled={Object.keys(ratings).length < 5 || loading} 
          onClick={onSubmit}
        >
          {loading ? 'Completing...' : 'Complete Onboarding'}
        </Button>
      </CardFooter>
    </Card>
  )
}
