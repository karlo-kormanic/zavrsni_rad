'use client';

import { createRoom } from '@/services/roomService';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QuizHeader = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const room = await createRoom();
      console.log('Room created:', room);
      // ✅ Redirect to host view
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
    <div className="flex justify-between p-3">
      <h1 className="text-xl font-bold mb-2 pt-3">Matematički kviz #3</h1>
      <div className="w-1/5">
        <button
          onClick={handleStartQuiz}
          disabled={loading}
          className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden border border-current bg-white px-8 py-3"
        >
          {loading ? 'Starting...' : 'Start the quiz'}
        </button>

        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHeader;
