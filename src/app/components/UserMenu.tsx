'use client'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image' // Add this import

export default function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url && (
          <Image
            src={user.user_metadata.avatar_url}
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full"
            priority // Optional: if this image is above the fold
          />
        )}
        <span>{user.email}</span>
      </div>
      <button 
        onClick={signOut}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        Sign Out
      </button>
    </div>
  )
}