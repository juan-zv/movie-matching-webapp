import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconUsers, IconHistory, IconStar } from '@tabler/icons-react'
import { SwipeDeck } from '@/components/SwipeDeck'
import { usePopularMovies } from '@/hooks/useMovies'
import { getImageUrl, type TMDBMovie } from '@/lib/tmdb'

type ViewState = 'rate' | 'sync' | 'profile'

export function HomePage() {
  const [view, setView] = useState<ViewState>('rate')
  const { data, isLoading, fetchNextPage, hasNextPage } = usePopularMovies()
  const [movieQueue, setMovieQueue] = useState<TMDBMovie[]>([])
  const [history, setHistory] = useState<(TMDBMovie & { score: number })[]>([])

  // Initialize and append to queue when data updates
  useEffect(() => {
    if (data?.pages) {
      const allMovies = data.pages.flatMap(p => p.results)
      // Only keep movies we haven't seen in history
      const unseenMovies = allMovies.filter(m => !history.some(h => h.id === m.id))
      setMovieQueue(unseenMovies)
    }
  }, [data, history])

  // Fetch more logic if queue runs low
  useEffect(() => {
    if (movieQueue.length < 3 && hasNextPage) {
      fetchNextPage()
    }
  }, [movieQueue.length, hasNextPage, fetchNextPage])

  const handleRate = (movie: TMDBMovie, score: number) => {
    setHistory(prev => [{ ...movie, score }, ...prev])
    setMovieQueue(prev => prev.slice(1)) // Remove first item
  }

  const handleSkip = () => {
    setMovieQueue(prev => prev.slice(1)) // Remove first item
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-[85vh] flex flex-col pt-4">
      {/* View Toggle */}
      <div className="flex justify-center gap-4 mb-6">
        <Button 
          variant={view === 'rate' ? "default" : "outline"} 
          size="icon" 
          className="rounded-full w-12 h-12"
          onClick={() => setView('rate')}
        >
          <IconStar size={24} />
        </Button>
        <Button 
          variant={view === 'sync' ? "default" : "outline"} 
          size="icon" 
          className="rounded-full w-12 h-12"
          onClick={() => setView('sync')}
        >
          <IconUsers size={24} />
        </Button>
        <Button 
          variant={view === 'profile' ? "default" : "outline"} 
          size="icon" 
          className="rounded-full w-12 h-12"
          onClick={() => setView('profile')}
        >
          <IconHistory size={24} />
        </Button>
      </div>

      <div className="flex-1 flex flex-col px-4 pb-20">
        {view === 'rate' && (
          isLoading && movieQueue.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse text-lg">Loading movies...</p>
            </div>
          ) : (
            <SwipeDeck 
              movies={movieQueue} 
              onRate={handleRate} 
              onSkip={handleSkip} 
            />
          )
        )}

        {view === 'sync' && (
          <Card className="w-full">
            <CardContent className="pt-6 space-y-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <IconUsers size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Sync with a Friend</h3>
                <p className="text-muted-foreground text-sm mt-2">Enter your friend's unique ID to find the perfect movie for your night.</p>
              </div>
              <div className="flex gap-2">
                <Input placeholder="User ID (e.g. #7721)" className="flex-1" />
                <Button>Sync</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {view === 'profile' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-primary to-primary/50 rounded-full mx-auto mb-4 shadow-lg" />
              <h3 className="text-xl font-bold">Your Taste Profile</h3>
              <p className="text-muted-foreground text-xs mt-1 uppercase tracking-widest">Sci-Fi Master • Drama Explorer</p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">Recently Rated</h4>
              {history.length > 0 ? history.map((m) => (
                <Card key={m.id} className="overflow-hidden">
                  <div className="flex p-3 gap-4 border-none items-center">
                    <img src={getImageUrl(m.poster_path, 'w500')} className="w-12 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                      <p className="font-bold text-sm leading-tight line-clamp-1">{m.title}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <IconStar 
                            key={i} 
                            size={16} 
                            className={i < m.score ? "text-yellow-500 fill-yellow-500" : "text-muted"} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )) : (
                <p className="text-center text-muted-foreground text-sm py-8">Rate some movies to see your history!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
