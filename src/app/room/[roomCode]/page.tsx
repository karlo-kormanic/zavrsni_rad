'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Room, Slide } from '@/../../types';
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

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const storedName = localStorage.getItem('player_name');
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', String(roomCode).toUpperCase())
        .single();

      const { data: slidesData } = await supabase
        .from('slides')
        .select('*')
        .order('id');

      if (roomData && slidesData) {
        setRoom(roomData);
        setSlides(slidesData);
      } else {
        setError('Failed to load room or slides');
      }

      setLoading(false);
    };

    fetchData();
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

  useEffect(() => {
    const fetchPlayerResponse = async () => {
      if (!room?.id || !slides.length || !playerName) return;

      const currentSlide = slides[room.current_slide_index];

      const { data, error } = await supabase
        .from('player_responses')
        .select('*')
        .eq('room_id', room.id)
        .eq('slide_id', currentSlide.id)
        .eq('player_name', playerName)
        .single();

      if (data) {
        setSubmitted(true);

        try {
          let parsed;

          if (currentSlide.questionType === 'multiple_choice') {
            parsed = data.selected_option;
          } else if (
            currentSlide.questionType === 'checkbox' ||
            currentSlide.questionType === 'scale'
          ) {
            parsed = JSON.parse(data.selected_option);
          }

          setSelectedOption(parsed);
        } catch {
          console.warn('Failed to parse stored answer.');
          setSelectedOption(null);
        }
      } else {
        setSubmitted(false);

        // 👇 Default for scale question is a sequential array of indices
        if (currentSlide.questionType === 'scale') {
          setSelectedOption(currentSlide.options.map((_, idx) => idx));
        } else {
          setSelectedOption(null);
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch previous response:', error.message);
      }
    };

    fetchPlayerResponse();
  }, [room?.id, slides, room?.current_slide_index, playerName]);


  const handleSubmit = async () => {
    if (!room || !slides.length || selectedOption === null || !playerName) return;

    const currentSlide = slides[room.current_slide_index];
    const questionType = currentSlide.questionType;

    const answerPayload =
      questionType === 'multiple_choice'
        ? selectedOption
        : JSON.stringify(selectedOption);

    const { error } = await supabase.from('player_responses').upsert(
      [
        {
          room_id: room.id,
          slide_id: currentSlide.id,
          player_name: playerName,
          selected_option: answerPayload,
        },
      ],
      {
        onConflict: 'room_id,slide_id,player_name',
      }
    );

    if (error) {
      console.error('Submission error:', error.message);
    } else {
      setSubmitted(true);
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !Array.isArray(selectedOption)) return;

    const oldIndex = selectedOption.indexOf(Number(active.id));
    const newIndex = selectedOption.indexOf(Number(over.id));

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(selectedOption, oldIndex, newIndex);
      setSelectedOption(newOrder);
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

  if (loading) return <div className="text-white">Loading...</div>;
  if (error || !room) return <div className="text-white">{error}</div>;

  if (!playerName) {
    return (
      <div className="text-white p-4">
        <h2 className="text-xl mb-2">Enter your name to join the room:</h2>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="text-black p-2 rounded border border-gray-300 mb-2 block w-100"
          placeholder="Your name"
        />
        {nameError && <p className="text-red-500 mb-2">{nameError}</p>}
        <button
          onClick={async () => {
            if (!nameInput.trim()) {
              setNameError('Name cannot be empty.');
              return;
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { data, error } = await supabase
              .from('player_responses')
              .select('player_name')
              .eq('room_id', room.id)
              .eq('player_name', nameInput.trim());

            if (data && data.length > 0) {
              setNameError('That name is already taken in this room. Please choose a different one.');
            } else {
              const cleanName = nameInput.trim();
              localStorage.setItem('player_name', cleanName);
              setPlayerName(cleanName);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Join Room
        </button>
      </div>
    );
  }

  const currentSlide = slides[room.current_slide_index];
  const questionType = currentSlide?.questionType;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Room Code: {room.room_code}</h1>

        {!room.has_started ? (
          <p>Waiting for host to start...</p>
        ) : currentSlide ? (
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black">{currentSlide.question}</h2>

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
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Submit
                </button>
              </>
            ) : (
              <p className="mt-4 text-green-600 font-semibold">Answer submitted!</p>
            )}
          </div>
        ) : (
          <p>No slide found.</p>
        )}
      </div>
    </div>
  );
}
