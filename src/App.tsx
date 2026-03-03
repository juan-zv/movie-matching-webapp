import { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { SignUp } from './components/SignUp'
import { Button } from './components/ui/button'
import { Progress } from './components/ui/progress'
import { MoviesPage } from './components/MoviesPage'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'

function AppContent() {
  const { user, loading, signOut } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [progress, setProgress] = useState(0)

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <h1 className="text-xl font-semibold text-slate-900">Movie Matching</h1>
        <Progress value={progress} className="w-64" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        {isLogin ? (
          <Login onSwitchToSignUp={() => setIsLogin(false)} />
        ) : (
          <SignUp onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold text-foreground">Movie Matching</h1>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <span className="text-sm text-muted-foreground">{user.email}</span>
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

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="movie-matching-theme">
      <AppContent />
    </ThemeProvider>
  )
}

export default App
