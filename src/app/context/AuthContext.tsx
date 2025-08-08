'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session, User, AuthError } from '@supabase/supabase-js'

type AuthContextType = {
  session: Session | null
  user: User | null
  signOut: () => Promise<AuthError | null>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setSession(null)
      setUser(null)
    }
    return error
  }

  return (
    <AuthContext.Provider value={{ session, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)