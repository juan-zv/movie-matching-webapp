import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

import { Step1AccountForm } from '@/features/onboarding/components/Step1AccountForm'
import { Step2ProfileForm } from '@/features/onboarding/components/Step2ProfileForm'
import { Step3RateMovies } from '@/features/onboarding/components/Step3RateMovies'

export function SignUp({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [localStep, setLocalStep] = useState<number>(1)

  useEffect(() => {
    // When user logs in after email verification or existing session
    if (user && !profile?.onboarding_completed) {
      if (!profile || profile.onboarding_step === 0) {
        supabase.from('profiles').upsert({ user_id: user.id, onboarding_step: 1 }).then(() => {
          refreshProfile()
        })
        setLocalStep(2)
      } else if (profile.onboarding_step === 1) {
        setLocalStep(2)
      } else if (profile.onboarding_step === 2) {
        setLocalStep(3)
      } else {
        setLocalStep(2) // Fallback
      }
    } else if (user && profile?.onboarding_completed) {
      navigate('/')
    }
  }, [user, profile, navigate, refreshProfile])

  const handleStep2Complete = async () => {
    await refreshProfile()
    setLocalStep(3)
  }

  const handleStep3Complete = async () => {
    await refreshProfile()
    navigate('/')
  }

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
        <Step1AccountForm 
          onSuccess={setSuccessMsg} 
          onSwitchToLogin={onSwitchToLogin} 
        />
      ) : localStep === 2 ? (
        <Step2ProfileForm 
          onComplete={handleStep2Complete} 
        />
      ) : (
        <Step3RateMovies 
          onComplete={handleStep3Complete} 
        />
      )}
    </div>
  )
}
