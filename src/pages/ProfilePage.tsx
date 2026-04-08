import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IconUser, IconStar, IconClock, IconLogout } from '@tabler/icons-react'
import { useMovieHistory } from '@/hooks/useMovieHistory'
import { getImageUrl } from '@/lib/tmdb'

export function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const { history, watchLater } = useMovieHistory()

  // Full name from user metadata if available, otherwise just use parts or fallback
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim()
    : 'Unknown User'

  // Safely parse primary_genres if it's an array
  let profilePicUrl = profile?.avatarl_url || null;
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
                  {profileInfo.topGenres.map(genre => (
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

      {/* Liked Movies History Sub-section */}
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>A collection of movies you've recently rated.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[32rem] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {history.filter(m => m.score > 0).length > 0 ? history.filter(m => m.score > 0).map((movie) => (
                <div 
                  key={movie.id} 
                className="flex flex-col p-4 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow gap-3"
              >
                <div className="flex gap-4">
                  <img src={getImageUrl(movie.poster_path, 'w500')} className="w-16 h-24 object-cover rounded-md" alt={movie.title} />
                  <div className="grow">
                    <h4 className="font-semibold line-clamp-2">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <IconStar 
                          key={i} 
                          size={16} 
                          className={i < movie.score ? "text-yellow-500 fill-yellow-500" : "text-muted"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-sm py-8 col-span-full text-center">Rate some movies to see your history!</p>
            )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Watch Later Sub-section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="w-5 h-5" /> 
            Watch Later
          </CardTitle>
          <CardDescription>Movies you saved to watch later.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[32rem] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {watchLater.length > 0 ? watchLater.map((movie) => (
                <div 
                  key={movie.id} 
                className="flex flex-col p-4 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow gap-3"
              >
                <div className="flex gap-4">
                  <img src={getImageUrl(movie.poster_path, 'w500')} className="w-16 h-24 object-cover rounded-md" alt={movie.title} />
                  <div className="grow">
                    <h4 className="font-semibold line-clamp-2">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-sm py-8 col-span-full text-center">Swipe right to save movies here!</p>
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
