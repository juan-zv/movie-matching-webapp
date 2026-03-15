import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { parseCSV, type Movie } from '@/lib/parseCSV'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MovieCard } from '@/components/MovieCard'
import { MovieCardSkeleton } from '@/components/skeletons/MovieCardSkeleton'

interface Step3RateMoviesProps {
  onComplete: () => void;
}

export function Step3RateMovies({ onComplete }: Step3RateMoviesProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [ratings, setRatings] = useState<Record<number, number>>({})

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch('https://imqqdsjzwxmevdxacnok.supabase.co/storage/v1/object/public/database/tmdb_5000_movies.csv')
        const csvText = await response.text()
        const parsedMovies = parseCSV(csvText)
        
        // Filter popular and highly rated
        const popular = parsedMovies.filter(m => m.vote_count > 2000)
        popular.sort((a, b) => b.vote_average - a.vote_average)
        
        setMovies(popular.slice(0, 10))
      } catch (e) {
        console.error("Error loading movies", e)
      }
    }
    fetchMovies()
  }, [])

  const handleRate = (movieId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [movieId]: rating }))
  }

  const onSubmit = async () => {
    if (Object.keys(ratings).length < 5) return
    if (!user) return
    setLoading(true)
    
    // For now we just mark onboarding completed. 
    // In the future: Insert ratings into a separate DB ratings table here.
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      onboarding_step: 3, 
      onboarding_completed: true,
    })
    
    if (!error) {
      onComplete()
    } else {
      console.error(error)
    }
    setLoading(false)
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
        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-4 w-full">
            <p className="text-sm font-medium text-foreground mb-4">Loading top movies...</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
              {Array.from({ length: 10 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {movies.map(movie => (
              <MovieCard 
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
