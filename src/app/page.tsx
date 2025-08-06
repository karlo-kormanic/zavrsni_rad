'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">QuizMaster</h1>
          <p className="text-gray-600 mb-8">Engage your audience with interactive quizzes</p>
          
          <div className="space-y-4">
            {/* Host Section */}
            <div className="border rounded-lg p-6 hover:bg-gray-50 transition">
              <h2 className="text-xl font-semibold mb-3">Host a Quiz</h2>
              <p className="text-gray-600 mb-4">Create and manage your interactive quizzes</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Host Login
              </button>
            </div>

            {/* Player Section */}
            <div className="border rounded-lg p-6 hover:bg-gray-50 transition">
              <h2 className="text-xl font-semibold mb-3">Join a Quiz</h2>
              <p className="text-gray-600 mb-4">Enter a room code to play</p>
              <button
                onClick={() => router.push('/join')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Play Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}