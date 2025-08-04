import { supabase } from '@/lib/supabaseClient'

export default function Auth() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (error) console.error('Error logging in with Google:', error)
  }

  return (
    <button 
      onClick={handleGoogleLogin}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Sign in with Google
    </button>
  )
}