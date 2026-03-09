import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfilePage() {
  const { user } = useAuth()

  // Placeholder data
  const profileInfo = {
    firstName: 'Juan',
    lastName: 'Zurita',
    city: 'Rexburg',
    state: 'ID',
    email: user?.email || 'user@example.com',
    profilePicUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder',
    topGenres: ['Sci-Fi', 'Thriller', 'Action'],
    likedMoviesHistory: [
      { id: 1, title: 'Inception', year: '2010', rating: 5 },
      { id: 2, title: 'The Matrix', year: '1999', rating: 4.5 },
      { id: 3, title: 'Interstellar', year: '2014', rating: 5 },
      { id: 4, title: 'Blade Runner 2049', year: '2017', rating: 4 }
    ]
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Profile Header Sub-section */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-muted flex-shrink-0 border-4 border-background shadow-sm">
            <img 
              src={profileInfo.profilePicUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center sm:text-left space-y-2 flex-grow">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {profileInfo.firstName} {profileInfo.lastName}
              </h2>
              <div className="text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                <span>📍 {profileInfo.city}, {profileInfo.state}</span>
                <span className="hidden sm:inline">•</span>
                <span>✉️ {profileInfo.email}</span>
              </div>
            </div>
            
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
          </div>
        </CardContent>
      </Card>

      {/* Liked Movies History Sub-section */}
      <Card>
        <CardHeader>
          <CardTitle>Liked Movies History</CardTitle>
          <CardDescription>A collection of movies you've highly rated.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profileInfo.likedMoviesHistory.map((movie) => (
              <div 
                key={movie.id} 
                className="flex flex-col p-4 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-grow">
                  <h4 className="font-semibold line-clamp-1">{movie.title}</h4>
                  <p className="text-sm text-muted-foreground">{movie.year}</p>
                </div>
                <div className="mt-4 flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium text-sm">{movie.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
