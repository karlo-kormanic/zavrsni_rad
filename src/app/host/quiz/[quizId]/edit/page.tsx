'use client'
/*import Toolbar from '@/components/Toolbar'
import TemplatePreview from '@/components/TemplatePreview' */
import { useParams } from 'next/navigation'
import SlideEditor from '@/components/SlideEditor'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function EditQuizPage() {
  const { quizId } = useParams()
  
  return (
    <ProtectedRoute>
      <div className="fixed inset-0 flex flex-col bg-white text-gray-500 overflow-hidden">
        {/* Quiz creator header */}
        <div className="h-16 flex items-center flex-shrink-0 px-8 border-b border-gray-300">
          <h1 className="text-lg font-medium">Quiz creator</h1>
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
          <div className="flex-1 overflow-auto">
            <SlideEditor quizId={quizId as string} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}