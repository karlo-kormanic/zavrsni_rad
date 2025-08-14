'use client'
/*import Toolbar from '@/components/Toolbar'
import TemplatePreview from '@/components/TemplatePreview' */
import { useParams } from 'next/navigation'
import SlideEditor from '@/components/SlideEditor'
import ProtectedRoute from '@/components/ProtectedRoute'
import UserMenu from '@/components/UserMenu'
import Link from 'next/link'

export default function EditQuizPage() {
  const { quizId } = useParams()
  
  return (
    <ProtectedRoute>
      <div className="fixed inset-0 flex flex-col bg-white text-gray-500 overflow-hidden">
        {/* Quiz creator header */}
        <div className="w-screen mx-auto pl-4 pr-5 py-3 flex justify-between items-center">
          <Link href="/host/dashboard" className="text-xl font-bold font-medium hover:text-blue-600 transition-colors">
            QuizMe - Quiz creator
          </Link>
          <UserMenu />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Toolbar 
          <div className="w-16 border-r border-gray-300">
            <Toolbar />
          </div>
          */}
          {/* Template preview
          <div className="w-64 border-r border-gray-300">
            <TemplatePreview />
          </div>
          */}
          {/* Slide editor - takes remaining space */}
          <div className="flex-1 overflow-auto h-[calc(100vh-4rem)]">
            <SlideEditor quizId={quizId as string} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}