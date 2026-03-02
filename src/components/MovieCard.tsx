import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card'
import type { Movie } from '@/lib/parseCSV'

interface MovieCardProps {
  movie: Movie
  userRating: number | null
  onRate: (movieId: number, rating: number) => void
}

function StarRating({ rating, onRate }: { rating: number | null; onRate: (rating: number) => void }) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating ?? rating ?? 0) >= star
        return (
          <button
            key={star}
            type="button"
            className="cursor-pointer transition-colors"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            onClick={() => onRate(star)}
            aria-label={`Rate ${star} stars`}
          >
            <svg
              className={`h-6 w-6 ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-slate-300'}`}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

export function MovieCard({ movie, userRating, onRate }: MovieCardProps) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="line-clamp-2">{movie.title}</CardTitle>
        <CardDescription>
          {year && <span>{year}</span>}
          {movie.runtime > 0 && <span className="ml-2">{movie.runtime} min</span>}
          {movie.vote_average > 0 && (
            <span className="ml-2">⭐ {movie.vote_average.toFixed(1)}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {movie.tagline && (
          <p className="mb-2 text-sm italic text-slate-500">"{movie.tagline}"</p>
        )}
        <p className="line-clamp-4 text-sm text-slate-600">{movie.overview}</p>
        {movie.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {movie.genres.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-slate-500">Your rating:</span>
        <StarRating 
          rating={userRating} 
          onRate={(rating) => onRate(movie.id, rating)} 
        />
      </CardFooter>
    </Card>
  )
}
