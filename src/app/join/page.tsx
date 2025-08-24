'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const code = roomCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', code)
      .single();

    if (error || !data) {
      setError('Room not found. Please check the code and try again.');
      setLoading(false);
      return;
    }

    router.push(`/room/${code}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100">
      <form
        onSubmit={handleJoinRoom}
        className="bg-white p-8 rounded shadow-md max-w-md w-full space-y-6"
      >
        <h2 className="text-2xl text-black font-semibold text-center">Join the Quiz</h2>

        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter a Quiz Room Code"
          className="w-full px-4 py-2 border text text-black border-gray-300 rounded-md uppercase"
          required
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-white transition ${
            loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Joining...' : 'Join Quiz'}
        </button>
      </form>
    </div>
  );
}
