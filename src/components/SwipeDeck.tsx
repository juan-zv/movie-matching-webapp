import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { IconChevronUp, IconStar } from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import type { TMDBMovie } from '@/lib/tmdb'
import { getImageUrl } from '@/lib/tmdb'

interface SwipeCardProps {
  movie: TMDBMovie
  onRate: (movie: TMDBMovie, rating: number) => void
  onSkip: () => void
  rating: number
  setRating: (r: number) => void
}

function SwipeCard({ movie, onRate, onSkip, rating, setRating }: SwipeCardProps) {
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, -200], [1, 0])
  const scale = useTransform(y, [0, -200], [1, 0.9])

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y < -150) {
      onSkip()
    }
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : ''

  return (
    <motion.div
      style={{ y, opacity, scale }}
      drag="y"
      dragConstraints={{ top: -300, bottom: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ y: -500, opacity: 0, transition: { duration: 0.3 } }}
      className="absolute inset-0 touch-none"
    >
      <Card className="h-full w-full overflow-hidden shadow-2xl relative border-white/10 flex flex-col justify-end bg-slate-900 rounded-3xl">
        <img 
          src={getImageUrl(movie.poster_path, 'original')} 
          alt={movie.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
          draggable="false"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 p-6 space-y-6 text-white pb-10">
          <div>
            <h2 className="text-3xl font-black mt-2 leading-none">{movie.title}</h2>
            <p className="text-slate-300 mt-2 font-medium">{year} • ⭐ {movie.vote_average.toFixed(1)}</p>
            <p className="text-sm text-slate-400 mt-3 line-clamp-3">{movie.overview}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest text-center">Rate this movie</p>
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setRating(star)}
                  onMouseLeave={() => setRating(0)}
                  onClick={() => onRate(movie, star)}
                  className="transition-transform active:scale-90 p-2"
                >
                  <IconStar 
                    size={36} 
                    className="transition-colors duration-200"
                    fill={rating >= star ? "#eab308" : "transparent"} 
                    color={rating >= star ? "#eab308" : "#94a3b8"} 
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

interface SwipeDeckProps {
  movies: TMDBMovie[]
  onRate: (movie: TMDBMovie, rating: number) => void
  onSkip: () => void
}

export function SwipeDeck({ movies, onRate, onSkip }: SwipeDeckProps) {
  const [rating, setRating] = useState<number>(0)
  const currentMovie = movies[0]

  useEffect(() => {
    setRating(0)
  }, [currentMovie?.id])

  if (!currentMovie) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center space-y-4">
        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
          <IconStar size={48} className="text-slate-300" />
        </div>
        <p className="text-lg">No more movies to swipe!<br/>Try adjusting your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto aspect-[2/3] relative flex flex-col">
      <div className="flex-1 relative">
        <AnimatePresence>
          <SwipeCard 
            key={currentMovie.id} 
            movie={currentMovie} 
            onRate={onRate} 
            onSkip={onSkip}
            rating={rating}
            setRating={setRating}
          />
        </AnimatePresence>
      </div>
      <div className="absolute -bottom-16 w-full flex flex-col items-center gap-1 opacity-50 animate-bounce pointer-events-none text-muted-foreground pb-4">
        <IconChevronUp size={24} />
        <span className="text-xs uppercase tracking-widest font-semibold">Swipe up to skip</span>
      </div>
    </div>
  )
}