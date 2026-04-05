import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconUsers, IconCopy, IconCheck, IconMovie, IconArrowLeft, IconHeart, IconX } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { fetchDiscoverMovies, type TMDBMovie } from '@/lib/tmdb'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { getImageUrl } from '@/lib/tmdb'

// Inline swiper specifically designed for the Sync Page
function SyncSwipeCard({ movie, onSave, onDiscard }: { movie: TMDBMovie, onSave: () => void, onDiscard: () => void }) {
  const x = useMotionValue(0)
  
  const opacity = useTransform(() => Math.max(0, 1 - Math.abs(x.get()) / 300))
  const scale = useTransform(() => Math.max(0.9, 1 - Math.abs(x.get()) / 1500))

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 120
    const velocityThreshold = 500

    const isRightSwipe = info.offset.x > threshold || info.velocity.x > velocityThreshold
    const isLeftSwipe = info.offset.x < -threshold || info.velocity.x < -velocityThreshold

    if (isRightSwipe) {
      requestAnimationFrame(() => onSave())
    } else if (isLeftSwipe) {
      requestAnimationFrame(() => onDiscard())
    }
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : ''

  return (
    <motion.div
      style={{ x, scale, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      exit={{ x: x.get() > 0 ? 800 : -800, opacity: 0, transition: { duration: 0.3 } }}
      className="absolute inset-0 touch-none flex hover:cursor-grab active:cursor-grabbing pb-20"
    >
      <Card className="flex-1 w-full overflow-hidden shadow-2xl relative border-white/10 flex flex-col justify-end bg-slate-900 rounded-3xl group">
        <img 
          src={getImageUrl(movie.poster_path, 'original')} 
          alt={movie.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" 
          draggable="false"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 p-6 space-y-4 text-white pointer-events-none">
          <div>
            <h2 className="text-3xl font-black mt-2 leading-none">{movie.title}</h2>
            <p className="text-slate-300 mt-2 font-medium">{year} • ⭐ {movie.vote_average.toFixed(1)}</p>
            <p className="text-sm text-slate-400 mt-3 line-clamp-3">{movie.overview}</p>
          </div>
        </div>

        {/* Action Buttons visible on mobile so drag is optional */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-20 pointer-events-auto">
          <button onClick={onDiscard} className="w-14 h-14 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <IconX size={28} stroke={3} />
          </button>
          <button onClick={onSave} className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <IconHeart size={28} stroke={3} />
          </button>
        </div>
      </Card>
    </motion.div>
  )
}

export function SyncPage() {
  const { user } = useAuth()
  const [view, setView] = useState<'lobby' | 'waiting' | 'swiping' | 'matched'>('lobby')
  
  // Lobby state
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Session state
  const [session, setSession] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  
  // UI state
  const [copied, setCopied] = useState(false)
  const [deck, setDeck] = useState<TMDBMovie[]>([])
  const [swipedMovieIds, setSwipedMovieIds] = useState<Set<number>>(new Set())
  const [matchFound, setMatchFound] = useState<TMDBMovie | null>(null)

  // Clean up function to exit session
  const exitSession = () => {
    setView('lobby')
    setSession(null)
    setParticipants([])
    setJoinCode('')
  }

  // Realtime subscription effect
  useEffect(() => {
    if (!session?.id) return

    const fetchParticipants = async () => {
      // 1. Fetch participants
      const { data: parts } = await supabase
        .from('session_participants')
        .select('user_id, joined_at')
        .eq('session_id', session.id)
      
      if (parts && parts.length > 0) {
        // 2. Fetch their profiles separately since both reference auth.users
        const userIds = parts.map(p => p.user_id)
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, genre_weights')
          .in('user_id', userIds)

        const profMap: Record<string, any> = {}
        if (profs) {
          profs.forEach(pr => { profMap[pr.user_id] = pr })
        }

        // 3. Merge them together for the state
        const merged = parts.map(p => ({
          ...p,
          profiles: profMap[p.user_id] || null
        }))
        setParticipants(merged)
      } else {
        setParticipants([])
      }
    }
    fetchParticipants()

    // Subscribe to participant additions
    const participantSub = supabase
      .channel(`participants:${session.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${session.id}` },
        () => {
          // Re-fetch participants when anything changes
          fetchParticipants()
        }
      )
      .subscribe()

    // Subscribe to session status changes (e.g. host starts swiping)
    const sessionSub = supabase
      .channel(`session:${session.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sync_sessions', filter: `id=eq.${session.id}` },
        (payload) => {
          setSession(payload.new)
          if (payload.new.status === 'swiping') setView('swiping')
          if (payload.new.status === 'matched') setView('matched')
        }
      )
      .subscribe()

    // Subscribe to swipes (The Match Engine Trigger)
    const matchSub = supabase
      .channel(`swipes:${session.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'session_swipes', filter: `session_id=eq.${session.id}` },
        async (payload) => {
          if (payload.new.action !== 'save') return

          // Check if EVERY participant has a 'save' row for this tmdb_id
          const { count } = await supabase
            .from('session_swipes')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)
            .eq('tmdb_id', payload.new.tmdb_id)
            .eq('action', 'save')
            
          // If the count of 'save' equals the room size, IT IS A MATCH!
          if (count === participants.length && count > 0) {
            // Find the movie object in our current deck 
            const winningMovie = deck.find(m => m.id === payload.new.tmdb_id)
            if (winningMovie) {
               setMatchFound(winningMovie)
               setView('matched')
               
               // Optional: Update session status
               if(user && session.created_by === user.id) {
                 await supabase.from('sync_sessions').update({ 
                   status: 'matched', 
                   matched_movie_id: winningMovie.id 
                 }).eq('id', session.id)
               }
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(participantSub)
      supabase.removeChannel(sessionSub)
      supabase.removeChannel(matchSub)
    }
  }, [session?.id, participants.length, deck, user?.id])

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const shortCode = generateShortCode()
      
      // 1. Create the session
      const { data: newSession, error: sessionError } = await supabase
        .from('sync_sessions')
        .insert({ short_code: shortCode, created_by: user.id })
        .select()
        .single()

      if (sessionError) throw sessionError

      // 2. Join as participant
      const { error: participantError } = await supabase
        .from('session_participants')
        .insert({ session_id: newSession.id, user_id: user.id })

      if (participantError) throw participantError

      setSession(newSession)
      setView('waiting')
    } catch (err: any) {
      setError(err.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async () => {
    if (!user || !joinCode) return
    setLoading(true)
    setError('')
    try {
      // 1. Find the session
      const { data: foundSession, error: sessionError } = await supabase
        .from('sync_sessions')
        .select('*')
        .eq('short_code', joinCode.toUpperCase())
        .maybeSingle()

      if (sessionError || !foundSession) throw new Error('Room not found or invalid code.')

      // 2. Join as participant
      const { error: participantError } = await supabase
        .from('session_participants')
        .insert({ session_id: foundSession.id, user_id: user.id })

      // Ignore duplicate join errors (23505) in case they try to join again
      if (participantError && participantError.code !== '23505') {
        throw participantError
      }

      setSession(foundSession)
      setView(foundSession.status === 'waiting' ? 'waiting' : foundSession.status)
    } catch (err: any) {
      setError(err.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (session?.short_code) {
      navigator.clipboard.writeText(session.short_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // When the room transitions to swiping, EVERYONE calculates the shared 
  // deck using the identical deterministic math!
  useEffect(() => {
    if (view === 'swiping' && deck.length === 0 && participants.length > 0) {
      const loadSharedDeck = async () => {
        const combinedWeights: Record<string, number> = {}
        participants.forEach((p) => {
          const weights = p.profiles?.genre_weights || {}
          Object.entries(weights).forEach(([genreId, weight]) => {
            combinedWeights[genreId] = (combinedWeights[genreId] || 0) + (weight as number)
          })
        })

        const topSharedGenres = Object.entries(combinedWeights)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([id]) => Number(id))

        const APIResponse = await fetchDiscoverMovies(topSharedGenres, 1)
        setDeck(APIResponse.results)
      }
      loadSharedDeck()
    }
  }, [view, deck.length, participants])

  const startSwiping = async () => {
    if (!session || session.created_by !== user?.id) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('sync_sessions')
        .update({ status: 'swiping' })
        .eq('id', session.id)

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Failed to start')
    } finally {
      setLoading(false)
    }
  }

  if (view === 'waiting') {
    return (
      <div className="w-full max-w-md mx-auto min-h-[85vh] flex flex-col pt-4">
        <Card className="my-auto mx-4 border-2 border-primary/20 bg-background/50 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="icon" onClick={exitSession}>
                <IconArrowLeft size={20} />
              </Button>
              <h2 className="text-xl font-bold">Waiting Room</h2>
              <div className="w-10"></div> {/* Spacer for center alignment */}
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">ROOM CODE</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-black font-mono tracking-wider text-primary">
                  {session?.short_code}
                </span>
                <Button variant="outline" size="icon" onClick={copyToClipboard} className="h-10 w-10">
                  {copied ? <IconCheck size={18} className="text-green-500" /> : <IconCopy size={18} />}
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <IconUsers size={18} className="text-primary" />
                Players Joined ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {i + 1}
                    </div>
                    <span className="font-medium text-sm">
                      {p.user_id === user?.id ? 'You' : `Player ${p.user_id.substring(0, 4)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {session?.created_by === user?.id ? (
              <Button 
                className="w-full h-12 text-lg font-bold shadow-lg" 
                onClick={startSwiping} 
                disabled={loading || participants.length < 2}
              >
                {loading ? 'Starting...' : 'Start Matching'}
              </Button>
            ) : (
              <div className="text-center text-sm font-medium text-muted-foreground p-3 bg-muted/50 rounded-lg animate-pulse">
                Waiting for host to start...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (view === 'swiping') {
    return (
      <div className="w-full max-w-md mx-auto min-h-[85vh] flex flex-col pt-4 overflow-hidden">
        <h2 className="text-xl font-bold text-center mb-6 px-4">Group Swipe Matcher</h2>
        
        {/* Swipe Deck View */}
        <div className="flex-1 w-full relative px-4 flex flex-col items-center">
            {deck.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-pulse">
                    <p className="text-muted-foreground">Waiting for host to shuffle the deck...</p>
                </div>
            ) : (
                <div className="w-full max-w-sm aspect-[2/3] max-h-[70vh] relative flex flex-col">
                    <div className="flex-1 relative">
                        <AnimatePresence>
                            {deck.filter(movie => !swipedMovieIds.has(movie.id)).slice(0, 1).map(movie => (
                                <SyncSwipeCard 
                                    key={movie.id} 
                                    movie={movie} 
                                    onSave={async () => {
                                        setSwipedMovieIds(prev => new Set(prev).add(movie.id))
                                        
                                        // Ensure the movie exists in our local cache to satisfy foreign keys
                                        await supabase.from('movies').upsert({
                                            tmdb_id: movie.id,
                                            title: movie.title,
                                            poster_url: movie.poster_path,
                                            summary: movie.overview,
                                            genre_ids: movie.genre_ids
                                        }, { onConflict: 'tmdb_id' })

                                        await supabase.from('session_swipes').insert({
                                            session_id: session.id,
                                            user_id: user?.id,
                                            tmdb_id: movie.id,
                                            action: 'save'
                                        })
                                    }}
                                    onDiscard={async () => {
                                        setSwipedMovieIds(prev => new Set(prev).add(movie.id))
                                        
                                        await supabase.from('movies').upsert({
                                            tmdb_id: movie.id,
                                            title: movie.title,
                                            poster_url: movie.poster_path,
                                            summary: movie.overview,
                                            genre_ids: movie.genre_ids
                                        }, { onConflict: 'tmdb_id' })

                                        await supabase.from('session_swipes').insert({
                                            session_id: session.id,
                                            user_id: user?.id,
                                            tmdb_id: movie.id,
                                            action: 'discard'
                                        })
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                        
                        {deck.filter(movie => !swipedMovieIds.has(movie.id)).length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl border-2 border-dashed border-muted">
                                <p className="text-lg font-medium">You finished the deck!<br/>Waiting on others...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        <div className="pb-8 pt-4 text-center">
            <Button variant="ghost" className="text-muted-foreground" onClick={exitSession}>Leave Room</Button>
        </div>
      </div>
    )
  }

  if (view === 'matched' && matchFound) {
    return (
        <div className="w-full max-w-md mx-auto min-h-[85vh] flex flex-col pt-8 space-y-6 px-4">
            <div className="text-center space-y-2 animate-in zoom-in slide-in-bottom-4 duration-500">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500 mb-2">
                   <IconHeart size={40} className="fill-current animate-pulse" />
                </div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">IT'S A MATCH!</h1>
                <p className="text-muted-foreground font-medium">Everyone in the room saved this movie.</p>
            </div>

            <Card className="overflow-hidden shadow-2xl border-white/10 relative group animate-in zoom-in duration-700 delay-150 fill-mode-both">
                <img 
                    src={getImageUrl(matchFound.poster_path, 'original')} 
                    alt={matchFound.title} 
                    className="w-full h-auto aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-white pt-24 text-center space-y-2">
                    <h2 className="text-2xl font-bold font-serif">{matchFound.title}</h2>
                    <p className="text-sm text-slate-300 opacity-90 line-clamp-3">{matchFound.overview}</p>
                </div>
            </Card>

            <Button size="lg" className="w-full font-bold h-14 text-lg" onClick={exitSession}>Return to Home</Button>
        </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-[85vh] flex flex-col pt-4">
      <div className="flex-1 flex flex-col px-4 justify-center space-y-6">
        
        {/* Create Room Card */}
        <Card className="w-full border-t-4 border-t-primary shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <IconMovie size={120} />
          </div>
          <CardContent className="pt-8 space-y-4 relative z-10">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">Host a Night</h3>
              <p className="text-muted-foreground text-sm">Create a group session. Everyone swipes on the same deck until you find a match.</p>
            </div>
            
            <Button 
              className="w-full h-12 font-bold text-md shadow-md hover:shadow-xl transition-all" 
              onClick={createRoom} 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create New Room'}
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium uppercase tracking-widest px-4">
          <div className="h-px bg-border flex-1"></div>
          OR
          <div className="h-px bg-border flex-1"></div>
        </div>

        {/* Join Room Card */}
        <Card className="w-full bg-muted/30">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-xl font-semibold text-center">Join Your Friends</h3>
            {error && <p className="text-sm text-destructive text-center font-medium bg-destructive/10 p-2 rounded">{error}</p>}
            
            <div className="flex gap-2">
              <Input 
                placeholder="Enter 6-digit code (e.g. A7B2X9)" 
                className="flex-1 text-base text-center tracking-widest font-mono uppercase"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={loading}
              />
            </div>
            <Button 
              variant="default" 
              className="w-full text-base" 
              onClick={joinRoom} 
              disabled={!joinCode || joinCode.length !== 6 || loading}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
