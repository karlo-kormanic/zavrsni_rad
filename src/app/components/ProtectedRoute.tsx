'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      }
      setIsChecking(false)
    }
  }, [user, isLoading, router])

  if (isLoading || isChecking) {
    return null
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}