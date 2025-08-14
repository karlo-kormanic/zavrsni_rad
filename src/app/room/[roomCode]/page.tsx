'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { Room, Slide } from '@/../../types';
import CountdownBar from '@/components/CountdownBar';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PlayerLayout from '@/components/PlayerLayout'

export default function RoomPage() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | number[] | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const router = useRouter();
  const prevSlideIndex = useRef<number | null>(null);
  const [quizTitle, setQuizTitle] = useState('');

  const sensors = useSensors(useSensor(PointerSensor));

  // Load player name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('player_name');
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  // Connection monitoring
  useEffect(() => {
    const channel = supabase.channel('connection-status')
      .on('presence', { event: 'sync' }, () => {
        console.log('Online status:', channel.presenceState());
      })
      .on('broadcast', { event: 'connection' }, (payload) => {
        setConnectionStatus(payload.payload.status);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial data fetch with retry logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch room data
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*, quizzes!inner(id)')
          .eq('room_code', String(roomCode).toUpperCase())
          .single();

        if (roomError || !roomData) {
          throw roomError || new Error('Room not found');
        }

        setRoom(roomData);
        prevSlideIndex.current = roomData.current_slide_index;

        // 2. Fetch slides
        const { data: slidesData, error: slidesError } = await supabase
          .from('slides')
          .select('*')
          .eq('quiz_id', roomData.quiz_id)
          .order('id');

        if (slidesError) throw slidesError;
        setSlides(slidesData || []);

        // 3. Fetch initial player response if exists
        if (playerName && slidesData?.length) {
          const currentSlide = slidesData[roomData.current_slide_index];
          if (currentSlide) {
            const { data: response } = await supabase
              .from('player_responses')
              .select('*')
              .eq('room_id', roomData.id)
              .eq('slide_id', currentSlide.id)
              .eq('player_name', playerName)
              .maybeSingle();

            setSubmitted(!!response);
            if (response) {
              try {
                const parsed = currentSlide.questionType === 'multiple_choice' 
                  ? response.selected_option 
                  : JSON.parse(response.selected_option);
                setSelectedOption(parsed);
              } catch {
                setSelectedOption(null);
              }
            }
          }
        }

        // 4. Fetch quiz title
        const { data: quizData } = await supabase
          .from('quizzes')
          .select('title')
          .eq('id', roomData.quiz_id)
          .single();
        
        if (quizData) {
          setQuizTitle(quizData.title);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomCode, playerName]);

  // Real-time updates
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        async (payload) => {
          const updatedRoom = payload.new as Room;
          
          // Reset submission state when slide changes
          if (prevSlideIndex.current !== updatedRoom.current_slide_index) {
            setSubmitted(false);
            prevSlideIndex.current = updatedRoom.current_slide_index;
          }

          setRoom(updatedRoom);

          // Handle results redirection
          if (updatedRoom.current_slide_index === -1) {
            router.push(`/player/results/${roomCode}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, roomCode, router]);

  // Handle slide changes
  useEffect(() => {
    if (room && slides.length > 0 && room.current_slide_index >= slides.length) {
      router.push(`/player/results/${roomCode}`);
    }
  }, [room, slides, roomCode, router]);

  // Fetch player response when slide changes
  useEffect(() => {
    const fetchPlayerResponse = async () => {
      if (!room || !slides.length || !playerName) return;

      const currentSlide = slides[room.current_slide_index];
      if (!currentSlide) return;

      const { data } = await supabase
        .from('player_responses')
        .select('*')
        .eq('room_id', room.id)
        .eq('slide_id', currentSlide.id)
        .eq('player_name', playerName)
        .maybeSingle();

      setSubmitted(!!data);
      if (data) {
        try {
          const parsed = currentSlide.questionType === 'multiple_choice'
            ? data.selected_option
            : JSON.parse(data.selected_option);
          setSelectedOption(parsed);
        } catch {
          setSelectedOption(null);
        }
      } else {
        setSelectedOption(currentSlide.questionType === 'scale' 
          ? currentSlide.options.map((_, idx) => idx) 
          : null);
      }
    };

    fetchPlayerResponse();
  }, [room, slides, room?.current_slide_index, playerName]);

  const handleSubmit = async () => {
    if (!room || !slides.length || selectedOption === null || !playerName) return;

    const currentSlide = slides[room.current_slide_index];
    const questionType = currentSlide.questionType;

    const answerPayload =
      questionType === 'multiple_choice'
        ? selectedOption
        : JSON.stringify(selectedOption);

    const { error: submissionError } = await supabase.from('player_responses').upsert(
      {
        room_id: room.id,
        slide_id: currentSlide.id,
        player_name: playerName,
        selected_option: answerPayload,
      },
      {
        onConflict: 'room_id,slide_id,player_name',
      }
    );

    if (!submissionError) {
      setSubmitted(true);
    } else {
      console.error('Submission failed:', submissionError);
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !Array.isArray(selectedOption)) return;

    const oldIndex = selectedOption.indexOf(Number(active.id));
    const newIndex = selectedOption.indexOf(Number(over.id));

    if (oldIndex !== -1 && newIndex !== -1) {
      setSelectedOption(arrayMove(selectedOption, oldIndex, newIndex));
    }
  }

  function SortableItem({ id, label }: { id: number; label: string }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-gray-100 p-2 rounded text-black mb-2 cursor-move"
      >
        {label}
      </li>
    );
  }

  // Connection status display
  if (connectionStatus === 'disconnected') {
    return (
      <div className="text-white p-4 text-center">
        <p className="text-red-500">Connection lost. Trying to reconnect...</p>
      </div>
    );
  }

  // Render loading/error states
  if (loading) {
    return (
      <div className="text-white p-4 text-center">
        <p>Loading quiz data...</p>
        {slides.length === 0 && (
          <p className="text-sm text-gray-400">This may take a moment...</p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white p-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-white p-4 text-center">
        <p>Room not found</p>
        <p className="text-sm text-gray-400">Please check the room code</p>
      </div>
    );
  }

  // Name input form
  if (!playerName) {
    return (
      <div className="text-black p-4 max-w-md mx-auto">
        <h2 className="text-xl mb-4">Join Quiz Room</h2>
        <div className="mb-4">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setNameError('');
            }}
            className="w-full p-3 rounded border border-gray-300 text-black"
            placeholder="Enter your name"
          />
          {nameError && <p className="text-red-500 mt-1">{nameError}</p>}
        </div>
        <button
          onClick={async () => {
            if (!nameInput.trim()) {
              setNameError('Please enter your name');
              return;
            }

            try {
              const { data } = await supabase
                .from('player_responses')
                .select('player_name')
                .eq('room_id', room.id)
                .eq('player_name', nameInput.trim());

              if (data?.length) {
                setNameError('Name already taken');
              } else {
                const cleanName = nameInput.trim();
                localStorage.setItem('player_name', cleanName);
                setPlayerName(cleanName);
              }
            } catch (err) {
              setNameError('Failed to verify name');
              console.error(err);
            }
          }}
          className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded transition"
        >
          Join Game
        </button>
      </div>
    );
  }

  // Waiting for quiz to start
  if (!room.has_started) {
    return (
      <PlayerLayout title={quizTitle ? `QuizMe - ${quizTitle}` : 'QuizMe'}>
        <div className="text-black p-5 pt-10 text-center">
          {quizTitle && (
            <h2 className="text-xl font-semibold mb-6">Welcome {playerName} to the quiz: {quizTitle}!</h2>
          )}
          <p className="text-lg font-semibold text-black p-4">
            Room code: {room.room_code}
          </p>
          <h2 className="text-lg pt-10">Get ready. The quiz will start shortly.</h2>
          {slides.length === 0 && (
            <p className="mt-4 text-gray-400">Loading questions...</p>
          )}
        </div>
      </PlayerLayout>
    );
  }

  // Current slide handling
  const currentSlide = slides[room.current_slide_index];
  if (!currentSlide) {
    return (
      <div className="text-white p-4 text-center">
        <p>Preparing question...</p>
        <p className="text-sm text-gray-400">
          {slides.length > 0 ? 'Almost ready!' : 'Waiting for questions...'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 rounded"
        >
          Refresh
        </button>
      </div>
    );
  }

  const questionType = currentSlide.questionType;

  // Main quiz interface
  return (
    <PlayerLayout title={quizTitle ? `QuizMe - ${quizTitle}` : 'QuizMe'}>
    <div className="min-h-screen text-black">
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Room: {room.room_code}</h1>
          <span className="px-3 py-1 rounded">
            Slide {room.current_slide_index + 1} of {slides.length}
          </span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-black">{currentSlide.question}</h2>
          {room?.auto_advance && room?.has_started && room.current_slide_index !== -1 && (
            <CountdownBar 
              key={`countdown-${room.current_slide_index}`}
              duration={room.slide_duration}
              active={room.auto_advance}
              slideIndex={room.current_slide_index}
            />
          )}

          {!submitted ? (
            <>
              <ul className="space-y-2">
                {questionType === 'multiple_choice' &&
                  currentSlide.options.map((opt, idx) => (
                    <li key={idx}>
                      <label className="flex items-center gap-2 cursor-pointer text-black">
                        <input
                          type="radio"
                          name="answer"
                          value={idx}
                          checked={selectedOption === idx}
                          onChange={() => setSelectedOption(idx)}
                        />
                        {String.fromCharCode(65 + idx)}) {opt}
                      </label>
                    </li>
                  ))}

                {questionType === 'checkbox' &&
                  currentSlide.options.map((opt, idx) => (
                    <li key={idx}>
                      <label className="flex items-center gap-2 cursor-pointer text-black">
                        <input
                          type="checkbox"
                          value={idx}
                          checked={Array.isArray(selectedOption) && selectedOption.includes(idx)}
                          onChange={(e) => {
                            if (!Array.isArray(selectedOption)) {
                              setSelectedOption([idx]);
                            } else {
                              const updated = e.target.checked
                                ? [...selectedOption, idx]
                                : selectedOption.filter((v) => v !== idx);
                              setSelectedOption(updated);
                            }
                          }}
                        />
                        {String.fromCharCode(65 + idx)}) {opt}
                      </label>
                    </li>
                  ))}

                {questionType === 'scale' && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={
                        Array.isArray(selectedOption)
                          ? selectedOption
                          : currentSlide.options.map((_, idx) => idx)
                      }
                      strategy={verticalListSortingStrategy}
                    >
                      <ul>
                        {(Array.isArray(selectedOption)
                          ? selectedOption
                          : currentSlide.options.map((_, idx) => idx)
                        ).map((idx) => (
                          <SortableItem
                            key={idx}
                            id={idx}
                            label={currentSlide.options[idx]}
                          />
                        ))}
                      </ul>
                    </SortableContext>
                  </DndContext>
                )}
              </ul>

              <button
                onClick={handleSubmit}
                disabled={
                  selectedOption === null ||
                  (Array.isArray(selectedOption) && selectedOption.length === 0)
                }
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Submit
              </button>
            </>
          ) : (
            <p className="mt-4 text-green-600 font-semibold">Answer submitted!</p>
          )}
        </div>
      </div>
    </div>
    </PlayerLayout>
  );
}