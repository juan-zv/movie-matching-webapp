import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card'
import type { TMDBMovie } from '@/lib/tmdb'
import { getImageUrl } from '@/lib/tmdb'
import { IconInfoCircle } from '@tabler/icons-react'

interface MovieCardProps {
  movie: TMDBMovie
  userRating: number | null
  onRate: (movieId: number, rating: number) => void
}

function StarRating({ rating, onRate }: { rating: number | null; onRate: (rating: number) => void }) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  
  return (
    <div 
      className="flex gap-1"
      onPointerDown={(e) => e.stopPropagation()} // Prevents accidental drag/scroll events when interacting with stars
    >
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
            aria-label={`Rate ${star} stars`}
          >
            <svg
              className={`h-6 w-6 transition-colors duration-200 ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-muted-foreground/30'}`}
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
  const [isExpanded, setIsExpanded] = useState(false)
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null
  
  return (
    <Card className="h-full flex flex-col overflow-hidden group">
      <div className="relative w-full aspect-[2/3] bg-muted overflow-hidden">
        {movie.poster_path ? (
          <>
            <img 
              src={getImageUrl(movie.poster_path)} 
              alt={`Poster for ${movie.title}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Dark overlay that appears on hover to make text readable if we were layering text, and gives a sleek effect */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-medium">
            No Poster
          </div>
        )}
        
        {/* Toggle overview button overlays on poster */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded-full text-foreground hover:bg-background transition-colors z-10"
          title="Toggle Details"
        >
          <IconInfoCircle size={20} className={isExpanded ? 'text-primary' : ''} />
        </button>

        {/* Expanded Info Overlay inside the poster area */}
        {isExpanded && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm p-4 overflow-y-auto z-0 animate-in fade-in zoom-in duration-200">
            <h4 className="font-bold mb-2">Overview</h4>
            <p className="text-sm text-foreground/90 leading-relaxed">{movie.overview || 'No overview available.'}</p>
          </div>
        )}
      </div>

      <CardHeader className="pt-4 pb-2 z-10 bg-card">
        <CardTitle className="line-clamp-2 leading-tight min-h-[2.5rem]">{movie.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {year && <span className="font-medium">{year}</span>}
          {movie.vote_average > 0 && (
            <span className="flex items-center gap-1">
              • ⭐ {movie.vote_average.toFixed(1)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      {!isExpanded && (
        <CardContent className="flex-1 py-2">
          <p className="line-clamp-3 text-sm text-muted-foreground">{movie.overview}</p>
        </CardContent>
      )}

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 pb-4 mt-auto border-t bg-muted/20">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {userRating ? 'Your rating:' : 'Rate:'}
        </span>
        <StarRating 
          rating={userRating} 
          onRate={(rating) => onRate(movie.id, rating)} 
        />
      </CardFooter>
    </Card>
  )
}
