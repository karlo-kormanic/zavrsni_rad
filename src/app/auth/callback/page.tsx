'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // 1. First check if already signed in (fast check)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/host/dashboard')
        router.refresh() // 👈 Force client-side state update
      }
    })

    // 2. Listen for auth changes (fallback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/host/dashboard')
        router.refresh() // 👈 Force client-side state update
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting you to dashboard...</p>
    </div>
  )
}