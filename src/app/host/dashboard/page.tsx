'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Quiz } from '@/../../types'

export default function QuizDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [newQuizTitle, setNewQuizTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  // Fetch quizzes with slide counts
  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })

      if (quizzesError) {
        console.error('Error fetching quizzes:', quizzesError)
        setLoading(false)
        return
      }

      const quizzesWithCounts = await Promise.all(
        (quizzesData || []).map(async (quiz) => {
          const { count } = await supabase
            .from('slides')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id)

          return {
            ...quiz,
            slides_count: count || 0
          }
        })
      )

      setQuizzes(quizzesWithCounts)
      setLoading(false)
    }

    fetchQuizzes()
  }, [])

  const createQuiz = async () => {
    if (!newQuizTitle.trim()) return
    
    setIsCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsCreating(false)
      return
    }

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        title: newQuizTitle,
        host_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating quiz:', error)
    } else {
      // Create default first slide
      const { error: slideError } = await supabase
        .from('slides')
        .insert({
          quiz_id: quiz.id,
          host_id: user.id,
          questionType: 'multiple_choice',
          options: ['', '', '', ''],
          answer: 0,
          note: '',
        })

      if (slideError) {
        console.error('Error creating default slide:', slideError)
      }
      router.push(`/host/quiz/${quiz.id}/edit`)
    }
    setIsCreating(false)
  }

  const deleteQuiz = async (quizId: string) => {
    setDeletingId(quizId)
    try {
      // First delete all slides (due to foreign key constraints)
      const { error: slidesError } = await supabase
        .from('slides')
        .delete()
        .eq('quiz_id', quizId)

      if (slidesError) throw slidesError

      // Then delete the quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)

      if (quizError) throw quizError

      // Update local state
      setQuizzes(quizzes.filter(q => q.id !== quizId))
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDelete = (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this quiz and all its questions?')) {
      deleteQuiz(quizId)
    }
  }

  if (loading) return <div className="p-4">Loading quizzes...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Quizzes</h1>
      
      {/* Create New Quiz */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Create a new quiz:</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuizTitle}
            onChange={(e) => setNewQuizTitle(e.target.value)}
            placeholder="Quiz title"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={createQuiz}
            disabled={isCreating || !newQuizTitle.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <p className="text-gray-500">No quizzes found. Create your first one!</p>
        ) : (
          quizzes.map((quiz) => (
            <div 
              key={quiz.id}
              onClick={() => router.push(`/host/quiz/${quiz.id}/edit`)}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{quiz.title}</h3>
                  <p className="text-gray-600 mt-1">
                    {quiz.slides_count || 0} Question{quiz.slides_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="absolute right-12 top-4 text-sm text-gray-500">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, quiz.id)}
                disabled={deletingId === quiz.id}
                className="absolute right-3 top-4 text-red-500 hover:text-red-700 disabled:opacity-50"
                aria-label="Delete quiz"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}