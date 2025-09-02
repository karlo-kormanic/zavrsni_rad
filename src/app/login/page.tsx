'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/host/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading || user) {
    return null // or return a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <GoogleLoginButton />
      </div>
    </div>
  )
}

function GoogleLoginButton() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (error) console.error('Login error:', error)
  }

  return (
    <button
      onClick={handleLogin}
      className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition"
    >
      Sign in with Google
    </button>
  )
}