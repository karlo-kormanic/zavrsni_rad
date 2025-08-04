'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Slide, PlayerResponse, Room } from '@/../../types';
import Scoreboard from '@/components/Scoreboard';
import { calculateScores } from '@/lib/calculateScores';

export default function PlayerResultsPage() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [responses, setResponses] = useState<PlayerResponse[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

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

  if (loading || !room) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center text-white mb-6">Final Results</h1>
      <Scoreboard scores={scores} isPlayerView />
    </div>
  );
}
