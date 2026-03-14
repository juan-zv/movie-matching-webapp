import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseCSV, type Movie } from '@/lib/parseCSV'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { MovieCard } from '@/components/MovieCard'

// Validation Schemas
const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

const step2Schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  ageRange: z.enum(["18-24", "25-32", "32-45", "45-60", "60+"], { message: "Select a valid age range" }),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export function SignUp({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { user, profile, signUp, refreshProfile } = useAuth()
  const navigate = useNavigate()
  
  // Logic states
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [localStep, setLocalStep] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [ratings, setRatings] = useState<Record<number, number>>({})

  // Forms
  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  useEffect(() => {
    // When user logs in after email verification or existing session
    if (user && !profile?.onboarding_completed) {
      if (!profile || profile.onboarding_step === 0) {
        // Automatically start step 2 logic, update db to 1
        supabase.from('profiles').upsert({ user_id: user.id, onboarding_step: 1 }).then(() => {
          refreshProfile()
        })
        setLocalStep(2)
      } else if (profile.onboarding_step === 1) {
        setLocalStep(2)
      } else if (profile.onboarding_step === 2) {
        setLocalStep(3)
      } else {
        setLocalStep(2)
      }
    } else if (user && profile?.onboarding_completed) {
      navigate('/')
    }
  }, [user, profile, navigate, refreshProfile])

  useEffect(() => {
    if (localStep === 3) {
      // Load top movies
      async function fetchMovies() {
        try {
          const response = await fetch('/tmdb_5000_movies.csv')
          const csvText = await response.text()
          const parsedMovies = parseCSV(csvText)
          
          // Filter popular and highly rated
          const popular = parsedMovies.filter(m => m.vote_count > 2000)
          popular.sort((a, b) => b.vote_average - a.vote_average)
          
          setMovies(popular.slice(0, 10))
        } catch (e) {
          console.error("Error loading movies", e)
        }
      }
      fetchMovies()
    }
  }, [localStep])

  const onSubmitStep1 = async (data: Step1Data) => {
    setLoading(true)
    const { error } = await signUp(data.email, data.password, {
      data: {
        full_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
      }
    })
    
    if (error) {
      form1.setError('root', { message: error.message })
    } else {
      setSuccessMsg("Account created successfully! Please check your email to verify your account. Once verified, refresh this page or sign in.")
    }
    setLoading(false)
  }

  const onSubmitStep2 = async (data: Step2Data) => {
    if (!user) return
    setLoading(true)
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      username: data.username,
      age_range: data.ageRange,
      avatarl_url: data.avatarUrl || null,
      onboarding_step: 2
    })
    
    if (error) {
      form2.setError('root', { message: error.message })
    } else {
      await refreshProfile()
      setLocalStep(3)
    }
    setLoading(false)
  }

  const handleRate = (movieId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [movieId]: rating }))
  }

  const onSubmitStep3 = async () => {
    if (Object.keys(ratings).length < 5) return
    if (!user) return
    setLoading(true)
    
    // For now we just mark onboarding completed.
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      onboarding_step: 2, // As per prompt requirement
      onboarding_completed: true,
    })
    
    if (!error) {
      await refreshProfile()
      navigate('/')
    }
    setLoading(false)
  }

  // Helper to ensure card content is consistently sized if needed
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      
      {successMsg ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Check your email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Alert variant="default" className="bg-green-50 text-green-900 border-green-200">
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
            <Button onClick={onSwitchToLogin} variant="secondary" className="w-full">
              Back to login
            </Button>
          </CardContent>
        </Card>
      ) : localStep === 1 ? (
        <Card className="max-w-md mx-auto shadow-sm">
          <CardHeader>
            <CardTitle className="text-center">Step 1: Create Account</CardTitle>
            <CardDescription className="text-center">Let's start your cinematic journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form1.handleSubmit(onSubmitStep1)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...form1.register('firstName')} placeholder="Jane" />
                  {form1.formState.errors.firstName && (
                    <p className="text-xs text-red-500">{form1.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...form1.register('lastName')} placeholder="Doe" />
                  {form1.formState.errors.lastName && (
                    <p className="text-xs text-red-500">{form1.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form1.register('email')} placeholder="jane@example.com" />
                {form1.formState.errors.email && (
                  <p className="text-xs text-red-500">{form1.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form1.register('password')} placeholder="••••••••" />
                {form1.formState.errors.password && (
                  <p className="text-xs text-red-500">{form1.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...form1.register('confirmPassword')} placeholder="••••••••" />
                {form1.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{form1.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              
              {form1.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{form1.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
            </form>
            
            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Button type="button" variant="link" className="h-auto p-0" onClick={onSwitchToLogin}>
                Sign in
              </Button>
            </p>
          </CardContent>
        </Card>
      ) : localStep === 2 ? (
        <Card className="max-w-md mx-auto shadow-sm">
          <CardHeader>
            <CardTitle className="text-center">Step 2: Profile Details</CardTitle>
            <CardDescription className="text-center">Tell us more so we can find the best matches.</CardDescription>
          </CardHeader>
          <CardContent>
             <form onSubmit={form2.handleSubmit(onSubmitStep2)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Unique Username</Label>
                <Input id="username" {...form2.register('username')} placeholder="movie_lover_99" />
                {form2.formState.errors.username && (
                  <p className="text-xs text-red-500">{form2.formState.errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range</Label>
                <select 
                  id="ageRange" 
                  {...form2.register('ageRange')}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select age range</option>
                  <option value="18-24">18-24</option>
                  <option value="25-32">25-32</option>
                  <option value="32-45">32-45</option>
                  <option value="45-60">45-60</option>
                  <option value="60+">60+</option>
                </select>
                {form2.formState.errors.ageRange && (
                  <p className="text-xs text-red-500">{form2.formState.errors.ageRange.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Profile Image URL (Optional)</Label>
                <Input id="avatarUrl" {...form2.register('avatarUrl')} placeholder="https://example.com/avatar.jpg" />
                {form2.formState.errors.avatarUrl && (
                  <p className="text-xs text-red-500">{form2.formState.errors.avatarUrl.message}</p>
                )}
              </div>
              
              {form2.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{form2.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Continue to Step 3'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full shadow-sm">
          <CardHeader>
            <CardTitle className="text-center font-bold text-2xl">Step 3: Rate Movies</CardTitle>
            <CardDescription className="text-center text-base mt-2">
              Please rate at least 5 of these popular movies to help us understand your taste.
              <span className="block mt-4 text-sm font-semibold p-2 bg-secondary text-secondary-foreground rounded-lg max-w-50 mx-auto">
                Rated: {Object.keys(ratings).length} / 5
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Progress value={50} className="w-64" />
                <p className="text-sm text-foreground">Loading top movies...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {movies.map(movie => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    userRating={ratings[movie.id] || null} 
                    onRate={handleRate} 
                  />
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t py-6 bg-card sticky bottom-0">
            <Button 
              size="lg"
              disabled={Object.keys(ratings).length < 5 || loading} 
              onClick={onSubmitStep3}
            >
              {loading ? 'Completing...' : 'Complete Onboarding'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
