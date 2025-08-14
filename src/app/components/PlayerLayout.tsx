'use client'
import { ReactNode } from 'react'

interface PlayerLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function PlayerLayout({ children, title = 'QuizMe' }: PlayerLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <h1 className="text-xl text-center font-bold font-medium">
            {title}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>
    </div>
  )
}