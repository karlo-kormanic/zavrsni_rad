'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [winnerCount, setWinnerCount] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [slideDuration, setSlideDuration] = useState(30);
  const autoAdvanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const roomRef = useRef<Room | null>(null);
  const slidesRef = useRef<Slide[]>([]);

  // Initialize data and subscriptions
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', String(roomCode).toUpperCase())
        .single();

      setRoom(roomData);

      const { data: slidesData } = await supabase
        .from('slides')
        .select('*')
        .eq('quiz_id', roomData.quiz_id)
        .order('id', { ascending: true });

      setSlides(slidesData ?? []);
      setLoading(false);
    };

    fetchInitialData();
  }, [roomCode]);

  // Set up room updates subscription
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

  // Set up QR code
  useEffect(() => {
    if (room?.room_code) {
      const joinUrl = `${window.location.origin}/room/${room.room_code}`;
      QRCode.toDataURL(joinUrl)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [room?.room_code]);

  // Keep refs updated
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

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

  // Fetch responses when slide changes
  useEffect(() => {
    fetchResponses();
  }, [room?.current_slide_index]);

  // Set up responses subscription
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

  const changeSlide = useCallback(async (delta: number) => {
    if (!room || changingSlide) return;

    setChangingSlide(true);

    try {
      // Get the latest room state to avoid race conditions
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

      setRoom(prev => 
        prev ? { ...prev, current_slide_index: newIndex } : prev
      );
    } catch (error) {
      console.error('Failed to change slide:', error);
    } finally {
      setChangingSlide(false);
    }
  }, [room, changingSlide, slides.length]);

  // Set up auto-advance timer
  useEffect(() => {
    if (room?.auto_advance && room.has_started && room.current_slide_index !== -1) {
      autoAdvanceIntervalRef.current = setInterval(() => {
        changeSlide(1);
      }, room.slide_duration * 1000);

      return () => {
        if (autoAdvanceIntervalRef.current) {
          clearInterval(autoAdvanceIntervalRef.current);
        }
      };
    }
  }, [room?.auto_advance, room?.has_started, room?.current_slide_index, room?.slide_duration, changeSlide]);

  const handleStartQuiz = async () => {
    if (!room) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ 
          has_started: true, 
          current_slide_index: 0,
          winner_count: winnerCount,
          auto_advance: autoAdvance,
          slide_duration: slideDuration
        })
        .eq('id', room.id);

      if (error) throw error;

      setRoom(prev => ({
        ...prev!,
        has_started: true,
        current_slide_index: 0,
        winner_count: winnerCount,
        auto_advance: autoAdvance,
        slide_duration: slideDuration
      }));
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoAdvance = async () => {
    if (!room) return;

    const newAutoAdvance = !room.auto_advance;
    const { error } = await supabase
      .from('rooms')
      .update({ auto_advance: newAutoAdvance })
      .eq('id', room.id);

    if (!error) {
      setRoom(prev => ({
        ...prev!,
        auto_advance: newAutoAdvance
      }));
    }
  };

  const updateSlideDuration = async (duration: number) => {
    if (!room) return;

    const { error } = await supabase
      .from('rooms')
      .update({ slide_duration: duration })
      .eq('id', room.id);

    if (!error) {
      setRoom(prev => ({
        ...prev!,
        slide_duration: duration
      }));
    }
  };

  const calculateScoresAndShow = async () => {
    if (!room) return;

    try {
      const { data: responses, error } = await supabase
        .from('player_responses')
        .select('player_name, slide_id, selected_option')
        .eq('room_id', room.id);

      if (error || !responses) throw error;

      const scoreMap = calculateScores(slides, responses);
      setScores(scoreMap);
      setShowingResults(true);

      await supabase
        .from('rooms')
        .update({ current_slide_index: -1 })
        .eq('id', room.id);
    } catch (error) {
      console.error('Failed to calculate scores:', error);
    }
  };

  if (loading || !room) return <div className="p-6">Loading...</div>;

  const currentSlide = slides[room.current_slide_index];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hosting Room: {room.room_code}</h1>

      {!room.has_started ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow max-w-md">
            <h2 className="text-lg font-semibold mb-4">Quiz Settings</h2>
            
            <div className="mb-4">
              <label className="block font-medium mb-2">Number of Winners</label>
              <input
                type="number"
                min="1"
                value={winnerCount}
                onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="autoAdvance"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
              />
              <label htmlFor="autoAdvance">Auto-advance slides</label>
            </div>
            
            {autoAdvance && (
              <div>
                <label className="block font-medium mb-2">Seconds per slide</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={slideDuration}
                  onChange={(e) => setSlideDuration(Math.max(5, Math.min(120, parseInt(e.target.value) || 30)))}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow max-w-md">
            <h2 className="text-lg font-semibold mb-2">Players can join by:</h2>
            <div className="mb-4">
              <p className="font-medium">1. Scanning this QR code:</p>
              {qrCodeUrl && (
                <div className="mt-2 p-2 bg-white rounded inline-block">
                  <Image 
                    src={qrCodeUrl} 
                    alt="Join Quiz QR Code" 
                    width={200}
                    height={200}
                    priority
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <p className="font-medium">2. Entering this code:</p>
              <p className="text-3xl font-bold p-2 pl-8 my-2">{room.room_code}</p>
            </div>
          </div>
          
          <button
            onClick={handleStartQuiz}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Quiz'}
          </button>
        </div>
      ) : (
        <>
          {room.current_slide_index !== -1 && (
            <>
              <div className="bg-white p-6 rounded shadow mb-4 max-w-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 text-sm">
                    Slide {room.current_slide_index + 1} of {slides.length}
                  </span>
                  {room.has_started && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={room.auto_advance}
                          onChange={toggleAutoAdvance}
                          className="h-4 w-4"
                        />
                        Auto
                      </label>
                      {room.auto_advance && (
                        <select
                          value={room.slide_duration}
                          onChange={(e) => updateSlideDuration(parseInt(e.target.value))}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {[15, 30, 45, 60].map((sec) => (
                            <option key={sec} value={sec}>{sec}s</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{currentSlide?.question}</h2>
                <ul className="mt-2 space-y-1">
                  {currentSlide?.options.map((opt: string, idx: number) => (
                    <li key={idx} className="text-gray-700">
                      <span className="font-semibold">{String.fromCharCode(65 + idx)})</span> {opt}
                      {(currentSlide.questionType === 'multiple_choice' ||
                        currentSlide.questionType === 'checkbox') &&
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
                <p className="text-lg font-semibold text-black">
                  {players.length} player{players.length === 1 ? '' : 's'} answered
                </p>
                <ul className="list-disc list-inside">
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

          {showingResults && (
            <Scoreboard 
              scores={scores} 
              isPlayerView={false} 
              winnerCount={room.winner_count || 1}
            />
          )}
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
  );
}