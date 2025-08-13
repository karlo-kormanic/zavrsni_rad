'use client';

import { createRoom } from '@/services/roomService';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface QuizHeaderProps {
  quizId: string;
  quizTitle: string;
  onTitleUpdate?: (newTitle: string) => Promise<void>;
}

const QuizHeader = ({ quizId, quizTitle, onTitleUpdate }: QuizHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(quizTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTempTitle(quizTitle);
  }, [quizTitle]);

  const handleSave = async () => {
    if (tempTitle.trim() && onTitleUpdate) {
      setLoading(true);
      try {
        await onTitleUpdate(tempTitle);
        setIsEditing(false);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleStartQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const room = await createRoom({
      quizId,
      hostId: user.id,
      winnerCount: 1,
      autoAdvance: false,
      slideDuration: 30
      });
      router.push(`/host/${room.room_code}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to create room:', message);
      setError('Failed to start quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-3">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            className="text-xl font-bold border-b-2 border-gray-300 focus:outline-none focus:border-indigo-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setTempTitle(quizTitle);
              }
            }}
          />
          <button
            onClick={handleSave}
            disabled={loading || !tempTitle.trim()}
            className="text-sm px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setTempTitle(quizTitle);
            }}
            className="text-sm px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{quizTitle}</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded transition"
            title="Edit title"
          >
            ✏️
          </button>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}
        <button
          onClick={handleStartQuiz}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:hover:bg-indigo-600"
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting...
            </span>
          ) : (
            'Start Quiz'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizHeader;