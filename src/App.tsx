import { useState, useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Progress } from '@/components/ui/progress'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { Layout } from '@/components/layout'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy loaded page components
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const SignUp = lazy(() => import('@/pages/SignUp').then(m => ({ default: m.SignUp })))
const MoviesPage = lazy(() => import('@/pages/MoviesPage').then(m => ({ default: m.MoviesPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const MatchingPage = lazy(() => import('@/pages/MatchingPage').then(m => ({ default: m.MatchingPage })))

// Page fallback for Suspense
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full h-full">
      <Skeleton className="h-10 w-48" />
      <div className="w-full max-w-4xl space-y-4 pt-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, profile, loading } = useAuth()
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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/login"
          element={
            user && profile?.onboarding_completed ? (
              <Navigate to="/" replace />
            ) : user && !profile?.onboarding_completed ? (
              <Navigate to="/signup" replace />
            ) : (
              <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground relative py-8">
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
            user && profile?.onboarding_completed ? (
              <Navigate to="/" replace />
            ) : (
              <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground relative py-8">
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
            ) : !profile?.onboarding_completed ? (
              <Navigate to="/signup" replace />
            ) : (
              <Layout />
            )
          }
        >
          <Route index element={<MoviesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="matching" element={<MatchingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
