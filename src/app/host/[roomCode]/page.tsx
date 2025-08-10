'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Slide, Room } from '@/../../types';
import Scoreboard from '@/components/Scoreboard';
import { calculateScores } from '@/lib/calculateScores';
import ProtectedRoute from '@/components/ProtectedRoute';
import QRCode from 'qrcode';
import Image from 'next/image';

function HostRoomPage() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingSlide, setChangingSlide] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<number, number>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showingResults, setShowingResults] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const roomRef = useRef<Room | null>(null);
  const slidesRef = useRef<Slide[]>([]);

  useEffect(() => {
    if (room?.room_code) {
      const joinUrl = `${window.location.origin}/join?room=${room.room_code}`;
      QRCode.toDataURL(joinUrl)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [room?.room_code]);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', String(roomCode).toUpperCase())
        .single();

      const { data: slidesData } = await supabase
        .from('slides')
        .select('*')
        .order('id', { ascending: true });

      setRoom(roomData ?? null);
      setSlides(slidesData ?? []);
      setLoading(false);
    };

    fetchInitialData();
  }, [roomCode]);

  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`room-updates-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const updatedRoom = payload.new as Room;
          setRoom(updatedRoom);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  const fetchResponses = async () => {
    const currentRoom = roomRef.current;
    const currentSlides = slidesRef.current;
    if (!currentRoom || currentSlides.length === 0) return;
    if (currentRoom.current_slide_index === -1) return;

    const currentSlide = currentSlides[currentRoom.current_slide_index];

    const { data: responses, error } = await supabase
      .from('player_responses')
      .select('player_name, selected_option')
      .eq('room_id', currentRoom.id)
      .eq('slide_id', currentSlide.id);

    if (error) {
      console.error('Failed to fetch player responses:', error.message);
      return;
    }

    const stats: Record<number, number> = {};
    const names = new Set<string>();

    responses.forEach((r) => {
      names.add(r.player_name);
      try {
        const parsed = JSON.parse(r.selected_option);
        if (Array.isArray(parsed)) {
          parsed.forEach((idx) => {
            stats[idx] = (stats[idx] || 0) + 1;
          });
        } else {
          stats[parsed] = (stats[parsed] || 0) + 1;
        }
      } catch {
        stats[r.selected_option] = (stats[r.selected_option] || 0) + 1;
      }
    });

    setPlayers(Array.from(names));
    setAnswerStats(stats);
  };

  useEffect(() => {
    fetchResponses();
  }, [room?.current_slide_index]);

  useEffect(() => {
    if (!room?.id) return;

    const responseChannel = supabase
      .channel(`response-updates-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_responses',
          filter: `room_id=eq.${room.id}`,
        },
        () => {
          fetchResponses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(responseChannel);
    };
  }, [room?.id]);

  const handleStart = async () => {
    if (!room) return;

    const { error } = await supabase
      .from('rooms')
      .update({ has_started: true, current_slide_index: 0 })
      .eq('id', room.id);

    if (error) {
      console.error('Failed to start quiz:', error.message);
    } else {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              has_started: true,
              current_slide_index: 0,
            }
          : prev
      );
    }
  };

  const changeSlide = async (delta: number) => {
    if (!room || changingSlide) return;

    setChangingSlide(true);

    const { data: latestRoom, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    if (fetchError || !latestRoom) {
      console.error('Failed to fetch latest room state:', fetchError?.message);
      setChangingSlide(false);
      return;
    }

    const newIndex = Math.min(
      Math.max(0, latestRoom.current_slide_index + delta),
      slides.length - 1
    );

    if (newIndex === latestRoom.current_slide_index) {
      setChangingSlide(false);
      return;
    }

    const { error } = await supabase
      .from('rooms')
      .update({ current_slide_index: newIndex })
      .eq('id', room.id);

    if (error) {
      console.error('Slide update error:', error.message);
      setChangingSlide(false);
      return;
    }

    setRoom((prev) =>
      prev
        ? {
            ...prev,
            current_slide_index: newIndex,
          }
        : prev
    );

    setChangingSlide(false);
  };

  const calculateScoresAndShow = async () => {
    if (!room) return;

    const { data: responses, error } = await supabase
      .from('player_responses')
      .select('player_name, slide_id, selected_option')
      .eq('room_id', room.id);

    if (error || !responses) {
      console.error('Failed to fetch responses for scoring:', error?.message);
      return;
    }

    const scoreMap = calculateScores(slides, responses);
    setScores(scoreMap);
    setShowingResults(true);

    await supabase
      .from('rooms')
      .update({ current_slide_index: -1 })
      .eq('id', room.id);
  };

  if (loading || !room) return <div>Loading...</div>;

  const currentSlide = slides[room.current_slide_index];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hosting Room: {room.room_code}</h1>

      {!room.has_started ? (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow max-w-md">
            <h2 className="text-lg font-semibold mb-2">Players can join by:</h2>
            <div className="mb-4">
              <p className="font-medium">1. Scanning this QR code:</p>
              {qrCodeUrl && (
                <div className="mt-2 p-2 bg-white rounded inline-block">
                  <Image 
                    src={qrCodeUrl} 
                    alt="Join Quiz QR Code" 
                    width={160} // Match your desired display size
                    height={160}
                    className="w-40 h-40" // Optional: Tailwind classes for styling
                    priority // Optional: If this is above the fold/LCP element
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <p className="font-medium">2. Entering this code:</p>
              <p className="text-3xl font-bold text-center my-2">{room.room_code}</p>
            </div>
            <div>
              <p className="font-medium">3. Or using this link:</p>
              <p className="text-sm text-blue-600 break-all">
                {window.location.origin}/join?room={room.room_code}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Start Quiz
          </button>
        </div>
      ) : (
        <>
          {room.current_slide_index !== -1 && (
            <>
              <div className="bg-white p-6 rounded shadow mb-4 max-w-xl">
                <div className="mb-2 text-gray-700 text-sm">
                  Slide {room.current_slide_index + 1} of {slides.length}
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{currentSlide?.question}</h2>
                <ul className="mt-2 space-y-1">
                  {currentSlide?.options.map((opt: string, idx: number) => (
                    <li key={idx} className="text-gray-700">
                      <span className="font-semibold">{String.fromCharCode(65 + idx)})</span> {opt}
                      {(currentSlide.questionType === 'multiple_choice' ||
                        currentSlide.questionType === 'checkbox') &&
                        room.has_started &&
                        answerStats[idx] !== undefined && (
                          <span className="ml-2 text-sm text-blue-600">
                            – {answerStats[idx]} answer{answerStats[idx] === 1 ? '' : 's'}
                          </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold text-white">
                  {players.length} player{players.length === 1 ? '' : 's'} answered the question
                </p>
                <ul className="list-disc list-inside text-white">
                  {players.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => changeSlide(-1)}
                  disabled={room.current_slide_index === 0 || changingSlide}
                  className="px-4 py-2 bg-gray-500 rounded disabled:opacity-50 text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => changeSlide(1)}
                  disabled={room.current_slide_index >= slides.length - 1 || changingSlide}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
                {room.current_slide_index === slides.length - 1 && (
                  <button
                    onClick={calculateScoresAndShow}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Show Results
                  </button>
                )}
              </div>
            </>
          )}

          {showingResults && <Scoreboard scores={scores} isPlayerView={false} />}
        </>
      )}
    </div>
  );
}

export default function ProtectedHostRoomPage() {
  return (
    <ProtectedRoute>
      <HostRoomPage />
    </ProtectedRoute>
  )
}