import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { IconChevronUp, IconChevronRight, IconStar } from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import type { TMDBMovie } from '@/lib/tmdb'
import { getImageUrl } from '@/lib/tmdb'

interface SwipeCardProps {
  movie: TMDBMovie
  onRate: (movie: TMDBMovie, rating: number) => void
  onSkip: (movie: TMDBMovie) => void
  onWatchLater: (movie: TMDBMovie) => void
  rating: number
  setRating: (r: number) => void
  onInteract: () => void
}

function SwipeCard({ movie, onRate, onSkip, onWatchLater, rating, setRating, onInteract }: SwipeCardProps) {
  const y = useMotionValue(0)
  const x = useMotionValue(0)
  
  // Use transforms based on dragging distance
  const opacity = useTransform(() => {
    const oy = Math.max(0, 1 - Math.abs(y.get()) / 300)
    const ox = Math.max(0, 1 - Math.abs(x.get()) / 300)
    return Math.min(oy, ox)
  })

  const scale = useTransform(() => {
    const dist = Math.sqrt(x.get() ** 2 + y.get() ** 2)
    return Math.max(0.9, 1 - dist / 1500)
  })

  const [exitDirection, setExitDirection] = useState<'up' | 'right'>('up')

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 120
    const velocityThreshold = 500

    const isRightSwipe = info.offset.x > threshold || info.velocity.x > velocityThreshold
    const isUpSwipe = info.offset.y < -threshold || info.velocity.y < -velocityThreshold

    // If swiped right more than up
    if (isRightSwipe && info.offset.x > Math.abs(info.offset.y)) {
      setExitDirection('right')
      // Defer slightly so react state applies for exit
      requestAnimationFrame(() => onWatchLater(movie))
    } else if (isUpSwipe && Math.abs(info.offset.y) > info.offset.x) {
      setExitDirection('up')
      requestAnimationFrame(() => onSkip(movie))
    }
    // If not triggered, framer-motion handles snapping back automatically
    // due to drag snap properties.
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : ''

  return (
    <motion.div
      style={{ y, x, scale, opacity }}
      drag
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      dragElastic={0.8}
      onDragStart={onInteract}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
      exit={{ 
        y: exitDirection === 'up' ? -800 : 0, 
        x: exitDirection === 'right' ? 800 : 0, 
        opacity: 0, 
        transition: { duration: 0.3, ease: 'easeOut' } 
      }}
      className="absolute inset-0 touch-none flex hover:cursor-grab active:cursor-grabbing"
    >
      <Card className="flex-1 w-full overflow-hidden shadow-2xl relative border-white/10 flex flex-col justify-end bg-slate-900 rounded-3xl group">
        <img 
          src={getImageUrl(movie.poster_path, 'original')} 
          alt={movie.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
          draggable="false"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

        {/* TMDB Watermark */}
        <div className="absolute top-4 right-4 opacity-50 pointer-events-none w-24 z-10">
          <img src="/primary-long-blue-tmdb.svg" alt="TMDB Logo" className="w-full h-auto drop-shadow-md" draggable="false" />
        </div>
        
        <div className="relative z-10 p-6 space-y-6 text-white pb-10 pointer-events-none">
          <div>
            <h2 className="text-3xl font-black mt-2 leading-none pointer-events-auto">{movie.title}</h2>
            <p className="text-slate-300 mt-2 font-medium">{year} • ⭐ {movie.vote_average.toFixed(1)}</p>
            <p className="text-sm text-slate-400 mt-3 line-clamp-3">{movie.overview}</p>
          </div>

          <div className="space-y-3 pointer-events-auto">
            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest text-center">Rate this movie</p>
            <div 
              className="flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10"
              onPointerDown={(e) => e.stopPropagation()} // Prevent accidental drag triggers
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setRating(star)}
                  onMouseLeave={() => setRating(0)}
                  onClick={() => onRate(movie, star)}
                  className="transition-transform active:scale-90 p-2 hover:scale-110"
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
  onSkip: (movie: TMDBMovie) => void
  onWatchLater: (movie: TMDBMovie) => void
}

export function SwipeDeck({ movies, onRate, onSkip, onWatchLater }: SwipeDeckProps) {
  const [rating, setRating] = useState<number>(0)
  const currentMovie = movies[0]
  const [hasInteracted, setHasInteracted] = useState(() => localStorage.getItem('hasSwiped') === 'true')

  const handleInteract = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
      localStorage.setItem('hasSwiped', 'true')
    }
  }

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
    <div className="w-full max-w-sm sm:max-w-md mx-auto aspect-[2/3] max-h-[70vh] sm:max-h-[75vh] relative flex flex-col">
      <div className="flex-1 relative">
        <AnimatePresence>
          <SwipeCard 
            key={currentMovie.id} 
            movie={currentMovie} 
            onRate={onRate}
            onSkip={onSkip} 
            onWatchLater={onWatchLater}
            rating={rating}
            setRating={setRating}
            onInteract={handleInteract}
          />
        </AnimatePresence>
      </div>
      <div className={`absolute -bottom-16 w-full flex flex-col items-center gap-1 opacity-50 pointer-events-none text-muted-foreground pb-4 transition-all duration-1000 ${hasInteracted ? 'opacity-0' : 'animate-bounce'}`}>
        <IconChevronUp size={24} />
        <span className="text-xs uppercase tracking-widest font-semibold">Swipe up to skip</span>
      </div>
      <div className={`absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 pointer-events-none text-muted-foreground rotate-90 origin-right transition-all duration-1000 ${hasInteracted ? 'opacity-0' : 'animate-pulse'}`}>
        <IconChevronRight size={24} />
        <span className="text-xs uppercase tracking-widest font-semibold">Swipe right for Watch Later</span>
      </div>
    </div>
  )
}