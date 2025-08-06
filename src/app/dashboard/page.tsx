'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Quiz } from '@/../../types' // Only import Quiz type here

export default function QuizDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [newQuizTitle, setNewQuizTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  // Fetch quizzes with slide counts (corrected query)
  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // First get quizzes
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

      // Then get slide counts for each quiz
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
      // Create default first slide (multiple choice)
      const { error: slideError } = await supabase
        .from('slides')
        .insert({
          quiz_id: quiz.id,
          host_id: user.id,
          questionType: 'multiple_choice',
          options: ['Option 1', 'Option 2'],
          answer: 0
        })

      if (slideError) {
        console.error('Error creating default slide:', slideError)
      }
      router.push(`/host/quiz/${quiz.id}/edit`)
    }
    setIsCreating(false)
  }

  if (loading) return <div className="p-4">Loading quizzes...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Quiz Sets</h1>
      
      {/* Create New Quiz */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Create New Quiz Set</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuizTitle}
            onChange={(e) => setNewQuizTitle(e.target.value)}
            placeholder="Quiz set title"
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
          <p className="text-gray-500">No quiz sets found. Create your first one!</p>
        ) : (
          quizzes.map((quiz) => (
            <div 
              key={quiz.id}
              onClick={() => router.push(`/host/quiz/${quiz.id}/edit`)}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{quiz.title}</h3>
                  <p className="text-gray-600 mt-1">
                    {quiz.slides_count || 0} questions
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}