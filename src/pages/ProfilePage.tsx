import { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IconUser, IconStar, IconClock, IconLogout, IconFilter, IconCalendar } from '@tabler/icons-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMovieHistory } from '@/hooks/useMovieHistory'
import { getImageUrl, GENRES } from '@/lib/tmdb'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const { history, watchLater } = useMovieHistory()
  
  // History Filters
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])

  // Calculate unique genres present in the user's history
  const availableGenres = useMemo(() => {
    const genreIdSet = new Set<number>()
    history.forEach(m => {
      if (m.score > 0 && Array.isArray(m.genre_ids)) {
        m.genre_ids.forEach(id => genreIdSet.add(id))
      }
    })
    return Array.from(genreIdSet).map(id => ({ id, name: GENRES[id] || 'Unknown' })).sort((a, b) => a.name.localeCompare(b.name))
  }, [history])

  // Filter history based on selected genres
  const filteredHistory = useMemo(() => {
    const ratedMovies = history.filter(m => m.score > 0)
    if (selectedGenres.length === 0) return ratedMovies
    
    return ratedMovies.filter(m => 
      Array.isArray(m.genre_ids) && m.genre_ids.some(id => selectedGenres.includes(id))
    )
  }, [history, selectedGenres])

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    )
  }

  // Watch Later Filters
  const [selectedWatchLaterGenres, setSelectedWatchLaterGenres] = useState<number[]>([])

  // Calculate unique genres present in the watch later list
  const availableWatchLaterGenres = useMemo(() => {
    const genreIdSet = new Set<number>()
    watchLater.forEach(m => {
      if (Array.isArray(m.genre_ids)) {
        m.genre_ids.forEach(id => genreIdSet.add(id))
      }
    })
    return Array.from(genreIdSet).map(id => ({ id, name: GENRES[id] || 'Unknown' })).sort((a, b) => a.name.localeCompare(b.name))
  }, [watchLater])

  // Filter watch later based on selected genres
  const filteredWatchLater = useMemo(() => {
    if (selectedWatchLaterGenres.length === 0) return watchLater
    
    return watchLater.filter(m => 
      Array.isArray(m.genre_ids) && m.genre_ids.some(id => selectedWatchLaterGenres.includes(id))
    )
  }, [watchLater, selectedWatchLaterGenres])

  const toggleWatchLaterGenre = (id: number) => {
    setSelectedWatchLaterGenres(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    )
  }

  // Full name from user metadata if available, otherwise just use parts or fallback
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim()
    : 'Unknown User'

  // Safely parse primary_genres if it's an array
  let profilePicUrl = profile?.avatar_url || profile?.avatarl_url || null;
  // If it's not a full URL (like an http prefix), assume it's just the filename in the bucket
  if (profilePicUrl && !profilePicUrl.startsWith('http')) {
    profilePicUrl = `https://imqqdsjzwxmevdxacnok.supabase.co/storage/v1/object/public/pictures/${profilePicUrl}`;
  }

  const profileInfo = {
    username: profile?.username || 'No username set',
    ageRange: profile?.age_range || 'Age not specified',
    email: user?.email || 'user@example.com',
    profilePicUrl: profilePicUrl,
    topGenres: Array.isArray(profile?.primary_genres) ? profile.primary_genres : []
  }

  const COLORS = ['#2563eb', '#db2777', '#9333ea', '#7c3aed', '#4f46e5', '#059669', '#3b82f6'];

  const genreChartData = useMemo(() => {
    if (!profile?.genre_weights) return [];
    return Object.entries(profile.genre_weights)
      .map(([id, weight]) => ({
        name: GENRES[Number(id)] || 'Other',
        weight: Math.round(weight as number * 100) / 100
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6);
  }, [profile?.genre_weights]);

  const activityData = useMemo(() => {
    return [
      { name: 'Rated', value: history.length, fill: '#10b981' }, // green
      { name: 'Watch Later', value: watchLater.length, fill: '#f59e0b' } // yellow
    ];
  }, [history.length, watchLater.length]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Profile Header Sub-section */}
      <Card className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 md:hidden text-muted-foreground"
          onClick={signOut}
          title="Sign Out"
        >
          <IconLogout className="w-5 h-5" />
        </Button>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-muted shrink-0 border-4 border-background shadow-sm flex items-center justify-center">
            {profileInfo.profilePicUrl ? (
              <img 
                src={profileInfo.profilePicUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <IconUser className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <div className="text-center sm:text-left space-y-2 grow">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {fullName}
              </h2>
              <div className="text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm">
                <span>@{profileInfo.username}</span>
                <span className="hidden sm:inline">•</span>
                <span>{profileInfo.ageRange}</span>
                <span className="hidden sm:inline">•</span>
                <span>✉️ {profileInfo.email}</span>
              </div>
            </div>
            
            {profileInfo.topGenres.length > 0 && (
              <div className="pt-2">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Top Genres</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {profileInfo.topGenres.map((genre: string) => (
                    <span 
                      key={genre} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Sub-section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Genre Weights</CardTitle>
            <CardDescription>Your algorithm preferences</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {genreChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <XAxis 
                    dataKey="name" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--muted)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                  />
                  <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                    {genreChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                <span>Not enough data yet</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Rated vs Watch Later</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] pt-4 relative flex flex-col">
            {(activityData[0].value > 0 || activityData[1].value > 0) ? (
              <>
                <div className="flex-1 relative min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text for the donut chart */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold">{activityData[0].value + activityData[1].value}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-4 mt-4 shrink-0 pb-2">
                   <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Rated ({activityData[0].value})
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div> Watch Later ({activityData[1].value})
                   </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                <span>No activity yet</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liked Movies History Sub-section */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>History</CardTitle>
            <CardDescription>A collection of movies you've recently rated.</CardDescription>
          </div>
          {availableGenres.length > 0 && (
            <Popover>
              <PopoverTrigger className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md px-3 text-xs h-8 gap-1">
                <IconFilter size={16} />
                <span>{selectedGenres.length > 0 ? `${selectedGenres.length} selected` : 'Filter'}</span>
              </PopoverTrigger>
              <PopoverContent align="end">
                <div className="font-medium text-sm mb-2">Filter by Genre</div>
                <div className="flex flex-col gap-1 my-2">
                  {availableGenres.map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`text-left px-2 py-1.5 text-sm rounded-md transition-colors ${selectedGenres.includes(genre.id) ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-accent hover:text-accent-foreground'}`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
                {selectedGenres.length > 0 && (
                  <button 
                    onClick={() => setSelectedGenres([])}
                    className="text-xs text-muted-foreground w-full text-center py-1 hover:text-foreground"
                  >
                    Clear Filters
                  </button>
                )}
              </PopoverContent>
            </Popover>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[32rem] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredHistory.length > 0 ? filteredHistory.map((movie) => (
                <div 
                  key={movie.id} 
                className="flex flex-col p-4 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow gap-3 relative group"
              >
                <div className="flex gap-4">
                  <img src={getImageUrl(movie.poster_path, 'w500')} className="w-16 h-24 object-cover rounded-md" alt={movie.title} />
                  <div className="grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold line-clamp-2 text-sm leading-tight">{movie.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <IconCalendar size={12} />
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                      </p>
                    </div>
                    <div className="flex gap-1 mt-auto">
                      {[...Array(5)].map((_, i) => (
                        <IconStar 
                          key={i} 
                          size={14} 
                          className={i < movie.score ? "text-yellow-500 fill-yellow-500" : "text-muted"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Visual Genre hint for filtered view */}
                {Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0 && (
                   <div className="w-full flex gap-1 flex-wrap mt-1">
                     {movie.genre_ids.slice(0, 3).map(id => (
                        <span key={id} className={`text-[10px] px-1.5 py-0.5 rounded-sm ${selectedGenres.includes(id) ? 'bg-primary/20 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}>
                          {GENRES[id] || 'Other'}
                        </span>
                     ))}
                   </div>
                )}
              </div>
            )) : history.filter(m => m.score > 0).length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 col-span-full text-center">Rate some movies to see your history!</p>
            ) : (
              <p className="text-muted-foreground text-sm py-8 col-span-full text-center">No movies match the selected genre filters.</p>
            )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Watch Later Sub-section */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <IconClock className="w-5 h-5" /> 
              Watch Later
            </CardTitle>
            <CardDescription>Movies you saved to watch later.</CardDescription>
          </div>
          {availableWatchLaterGenres.length > 0 && (
            <Popover>
              <PopoverTrigger className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md px-3 text-xs h-8 gap-1">
                <IconFilter size={16} />
                <span>{selectedWatchLaterGenres.length > 0 ? `${selectedWatchLaterGenres.length} selected` : 'Filter'}</span>
              </PopoverTrigger>
              <PopoverContent align="end">
                <div className="font-medium text-sm mb-2">Filter by Genre</div>
                <div className="flex flex-col gap-1 my-2">
                  {availableWatchLaterGenres.map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => toggleWatchLaterGenre(genre.id)}
                      className={`text-left px-2 py-1.5 text-sm rounded-md transition-colors ${selectedWatchLaterGenres.includes(genre.id) ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-accent hover:text-accent-foreground'}`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
                {selectedWatchLaterGenres.length > 0 && (
                  <button 
                    onClick={() => setSelectedWatchLaterGenres([])}
                    className="text-xs text-muted-foreground w-full text-center py-1 hover:text-foreground"
                  >
                    Clear Filters
                  </button>
                )}
              </PopoverContent>
            </Popover>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[32rem] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredWatchLater.length > 0 ? filteredWatchLater.map((movie) => (
                <div 
                  key={movie.id} 
                className="flex flex-col p-4 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow gap-3 relative group"
              >
                <div className="flex gap-4">
                  <img src={getImageUrl(movie.poster_path, 'w500')} className="w-16 h-24 object-cover rounded-md" alt={movie.title} />
                  <div className="grow">
                    <h4 className="font-semibold line-clamp-2 leading-tight">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <IconCalendar size={12} />
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                    </p>
                  </div>
                </div>
                {/* Visual Genre hint for filtered view */}
                {Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0 && (
                   <div className="w-full flex gap-1 flex-wrap mt-1">
                     {movie.genre_ids.slice(0, 3).map(id => (
                        <span key={id} className={`text-[10px] px-1.5 py-0.5 rounded-sm ${selectedWatchLaterGenres.includes(id) ? 'bg-primary/20 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}>
                          {GENRES[id] || 'Other'}
                        </span>
                     ))}
                   </div>
                )}
              </div>
            )) : watchLater.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 col-span-full text-center">Swipe right to save movies here!</p>
            ) : (
              <p className="text-muted-foreground text-sm py-8 col-span-full text-center">No movies match the selected genre filters.</p>
            )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground/60 pb-8 pointer-events-none">
        <p>Attribution Notice: This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        <img src="/primary-long-blue-tmdb.svg" alt="TMDB Logo" className="h-4 mx-auto mt-2 opacity-50" />
      </div>
    </div>
  )
}
