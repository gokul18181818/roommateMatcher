import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { SignInPage } from '@/components/auth/SignInPage'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  useAuth() // Initialize auth state
  const { user, loading } = useAuthStore()

  useEffect(() => {
    if (!loading && user) {
      navigate('/explore', { replace: true })
    }
  }, [user, loading, navigate])

  const handleLinkedInLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('LinkedIn login error:', error)
      alert('Failed to sign in with LinkedIn. Please try again.')
    }
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <SignInPage
        onLinkedInSignIn={handleLinkedInLogin}
        onSignIn={(e) => {
          e.preventDefault()
          // Email/password sign-in can be implemented later if needed
        }}
        onCreateAccount={() => {
          // Can navigate to sign-up page if needed
        }}
        onResetPassword={() => {
          // Can implement password reset flow
        }}
      />
    </div>
  )
}

