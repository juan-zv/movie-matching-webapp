import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { SignUp } from './components/SignUp'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

export function App() {
  const { user, loading, signOut } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-slate-900"></div>
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
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold text-slate-900">Movie Matching</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user.email}</span>
            <Button variant="secondary" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Movie Matching!</CardTitle>
            <CardDescription>You are now signed in as {user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Start building your movie matching experience from here.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default App
