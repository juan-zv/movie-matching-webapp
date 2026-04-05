import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

type Step1Data = z.infer<typeof step1Schema>

interface Step1AccountFormProps {
  onSwitchToLogin: () => void;
}

export function Step1AccountForm({ onSwitchToLogin }: Step1AccountFormProps) {
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const form = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })

  const onSubmit = async (data: Step1Data) => {
    setLoading(true)
    const { error } = await signUp(data.email, data.password, {
      data: {
        full_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
      }
    })
    
    if (error) {
      form.setError('root', { message: error.message })
      setLoading(false)
    }
    // We do not set loading to false on success because the AuthContext listener
    // will detect the new active session (email confirmation disabled) and unmount this form.
  }

  return (
    <Card className="max-w-md mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-center">Step 1: Create Account</CardTitle>
        <CardDescription className="text-center">Let's start your cinematic journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...form.register('firstName')} placeholder="Jane" />
              {form.formState.errors.firstName && (
                <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...form.register('lastName')} placeholder="Doe" />
              {form.formState.errors.lastName && (
                <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} placeholder="jane@example.com" />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register('password')} placeholder="••••••••" />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} placeholder="••••••••" />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
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
  )
}
