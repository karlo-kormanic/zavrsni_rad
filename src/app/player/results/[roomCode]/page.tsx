'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Slide, PlayerResponse, Room } from '@/../../types';
import Scoreboard from '@/components/Scoreboard';
import { calculateScores } from '@/lib/calculateScores';
import PlayerLayout from '@/components/PlayerLayout';

export default function PlayerResultsPage() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [responses, setResponses] = useState<PlayerResponse[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [winnerInfoSubmitted, setWinnerInfoSubmitted] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [winnerInfo, setWinnerInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Load player name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('player_name');
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!roomCode) return;

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', String(roomCode).toUpperCase())
        .maybeSingle();

      if (roomError || !roomData) {
        console.error('Failed to fetch room:', roomError?.message);
        setLoading(false);
        return;
      }

      setRoom(roomData);

      const { data: quizData } = await supabase
        .from('quizzes')
        .select('title')
        .eq('id', roomData.quiz_id)
        .single();

      if (quizData) {
        setQuizTitle(quizData.title);
      }

      const { data: slidesData, error: slidesError } = await supabase
        .from('slides')
        .select('*')
        .order('id');

      if (slidesError) {
        console.error('Failed to fetch slides:', slidesError.message);
      }

      setSlides(slidesData || []);

      const { data: responsesData, error: responsesError } = await supabase
        .from('player_responses')
        .select('*')
        .eq('room_id', roomData.id);

      if (responsesError) {
        console.error('Failed to fetch responses:', responsesError.message);
      }

      setResponses(responsesData || []);
      setLoading(false);
    };

    fetchResults();
  }, [roomCode]);

  useEffect(() => {
    if (slides.length > 0 && responses.length > 0) {
      const scoreMap = calculateScores(slides, responses);
      setScores(scoreMap);
    }
  }, [slides, responses]);

  const isWinner = () => {
    if (!playerName || !scores) return false;
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winnerCount = room?.winner_count || 1;
    return sorted.slice(0, winnerCount).some(([name]) => name === playerName);
  };

  const handleWinnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !playerName) return;

    try {
      const { error } = await supabase
        .from('winners')
        .upsert({
          room_id: room.id,
          player_id: playerName,
          first_name: winnerInfo.firstName,
          last_name: winnerInfo.lastName,
          email: winnerInfo.email
        });

      if (error) throw error;
      setWinnerInfoSubmitted(true);
    } catch (error) {
      console.error('Failed to submit winner info:', error);
    }
  };

  if (loading || !room) return <div className="p-6 text-white">Loading...</div>;

  const won = isWinner();
  const showWinnerForm = won && !winnerInfoSubmitted;

  return (
    <PlayerLayout title={quizTitle ? `QuizMe - ${quizTitle}` : 'QuizMe'}>
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center text-black mb-6">Final Results</h1>
      
      {won ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Scoreboard 
            scores={scores} 
            isPlayerView 
            currentPlayer={playerName} 
          />

          {showWinnerForm ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl text-center font-semibold text-white mb-4">Congratulations! 🎉</h2>
              <p className="text-gray-300 mb-4">You won! Please provide your information to receive your reward:</p>
              
              <form onSubmit={handleWinnerSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">First Name:</label>
                  <input
                    type="text"
                    value={winnerInfo.firstName}
                    onChange={(e) => setWinnerInfo({...winnerInfo, firstName: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Last Name:</label>
                  <input
                    type="text"
                    value={winnerInfo.lastName}
                    onChange={(e) => setWinnerInfo({...winnerInfo, lastName: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Email:</label>
                  <input
                    type="email"
                    value={winnerInfo.email}
                    onChange={(e) => setWinnerInfo({...winnerInfo, email: e.target.value})}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Submit Information
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Thank you!</h2>
              <p className="text-gray-300">Your information has been submitted successfully.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Scoreboard 
              scores={scores} 
              isPlayerView 
              currentPlayer={playerName} 
            />
          </div>
        </div>
      )}
    </div>
    </PlayerLayout>
  );
}