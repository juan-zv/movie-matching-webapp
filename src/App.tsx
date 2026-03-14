import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Login } from '@/pages/Login'
import { SignUp } from '@/pages/SignUp'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MoviesPage } from '@/pages/MoviesPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { MatchingPage } from '@/pages/MatchingPage'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 150)
      return () => clearInterval(timer)
    } else {
      setProgress(100)
    }
  }, [loading])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <h1 className="text-xl font-semibold">Movie Matching</h1>
        <Progress value={progress} className="w-64" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground relative">
              <div className="absolute top-4 right-4">
                <ModeToggle />
              </div>
              <Login onSwitchToSignUp={() => navigate('/signup')} />
            </div>
          )
        }
      />
      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground relative">
              <div className="absolute top-4 right-4">
                <ModeToggle />
              </div>
              <SignUp onSwitchToLogin={() => navigate('/login')} />
            </div>
          )
        }
      />
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen bg-background">
              <nav className="border-b bg-card">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                  <h1 className="text-xl font-semibold text-foreground cursor-pointer" onClick={() => navigate('/')}>Movie Matching</h1>
                  <div className="flex items-center gap-3">
                    <ModeToggle />
                    <Button variant="ghost" className="text-sm text-muted-foreground" onClick={() => navigate('/profile')}>
                      {user.email}
                    </Button>
                    <Button variant="secondary" onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </nav>
              <main className="mx-auto w-full max-w-6xl px-4 py-8">
                <MoviesPage />
              </main>
            </div>
          )
        }
      />
      <Route
        path="/profile"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen bg-background">
              <nav className="border-b bg-card">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                  <h1 className="text-xl font-semibold text-foreground cursor-pointer" onClick={() => navigate('/')}>Movie Matching</h1>
                  <div className="flex items-center gap-3">
                    <ModeToggle />
                    <Button variant="ghost" className="text-sm text-muted-foreground" onClick={() => navigate('/profile')}>
                      {user.email}
                    </Button>
                    <Button variant="secondary" onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </nav>
              <main className="mx-auto w-full max-w-6xl px-4 py-8">
                <ProfilePage />
              </main>
            </div>
          )
        }
      />
      <Route
        path="/matching"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="min-h-screen bg-background">
              <nav className="border-b bg-card">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                  <h1 className="text-xl font-semibold text-foreground cursor-pointer" onClick={() => navigate('/')}>Movie Matching</h1>
                  <div className="flex items-center gap-3">
                    <ModeToggle />
                    <Button variant="ghost" className="text-sm text-muted-foreground" onClick={() => navigate('/profile')}>
                      {user.email}
                    </Button>
                    <Button variant="secondary" onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </nav>
              <main className="mx-auto w-full max-w-6xl px-4 py-8">
                <MatchingPage />
              </main>
            </div>
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="movie-matching-theme">
      <AppContent />
    </ThemeProvider>
  )
}

export default App
