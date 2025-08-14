'use client'
import { ReactNode } from 'react'
import UserMenu from '@/components/UserMenu'
import Link from 'next/link'

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 py-3 flex justify-between items-center">
          <Link href="/host/dashboard" className="text-xl font-bold font-medium hover:text-blue-600 transition-colors">
            QuizMe
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}