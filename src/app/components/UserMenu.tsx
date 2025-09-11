'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'

export default function UserMenu() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const error = await signOut()
      if (!error) {
        router.push('/')
        router.refresh()
      } else {
        console.error('Sign out error:', error)
      }
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url}
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full"
            priority
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="hidden md:inline">{user.email}</span>
      </div>
      <button 
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition text-sm disabled:opacity-50"
        aria-label="Sign out"
      >
        {isSigningOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  )
}