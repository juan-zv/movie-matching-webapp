import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const step2Schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  ageRange: z.enum(["18-24", "25-32", "32-45", "45-60", "60+"], { message: "Select a valid age range" }),
})

type Step2Data = z.infer<typeof step2Schema>

interface Step2ProfileFormProps {
  onComplete: () => void;
}

export function Step2ProfileForm({ onComplete }: Step2ProfileFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  const form = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const onSubmit = async (data: Step2Data) => {
    if (!user) return
    setLoading(true)

    let finalAvatarUrl: string | null = null;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('pictures')
        .upload(fileName, avatarFile)

      if (uploadError) {
        form.setError('root', { message: `Image upload failed: ${uploadError.message}` })
        setLoading(false)
        return
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('pictures')
        .getPublicUrl(fileName)
        
      finalAvatarUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      username: data.username,
      age_range: data.ageRange,
      avatarl_url: finalAvatarUrl,
      onboarding_step: 2
    })
    
    if (error) {
      form.setError('root', { message: error.message })
    } else {
      onComplete()
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-md mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-center">Step 2: Profile Details</CardTitle>
        <CardDescription className="text-center">Tell us more so we can find the best matches.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Unique Username</Label>
            <Input id="username" {...form.register('username')} placeholder="movie_lover_99" />
            {form.formState.errors.username && (
              <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ageRange">Age Range</Label>
            <select 
              id="ageRange" 
              {...form.register('ageRange')}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select age range</option>
              <option value="18-24">18-24</option>
              <option value="25-32">25-32</option>
              <option value="32-45">32-45</option>
              <option value="45-60">45-60</option>
              <option value="60+">60+</option>
            </select>
            {form.formState.errors.ageRange && (
              <p className="text-xs text-red-500">{form.formState.errors.ageRange.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarFile">Profile Image (Optional)</Label>
            <Input 
              id="avatarFile" 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAvatarFile(file);
                else setAvatarFile(null);
              }}
            />
          </div>
          
          {form.formState.errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Continue to Step 3'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
