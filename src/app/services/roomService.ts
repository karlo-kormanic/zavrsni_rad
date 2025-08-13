import { supabase } from '@/lib/supabaseClient';

interface CreateRoomParams {
  quizId: string;
  hostId: string;
  winnerCount?: number;
  autoAdvance?: boolean;
  slideDuration?: number;
}

export async function createRoom({
  quizId,
  hostId,
  winnerCount = 1,
  autoAdvance = false,
  slideDuration = 30
}: CreateRoomParams) {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      room_code: roomCode,
      status: 'waiting',
      current_slide_index: 0,
      has_started: false,
      quiz_id: quizId,
      host_id: hostId,
      winner_count: winnerCount,
      auto_advance: autoAdvance,
      slide_duration: slideDuration
    })
    .select()
    .single();
  
  if (error) throw error;
  return {
    ...data,
    joinUrl: `${window.location.origin}/join?room=${roomCode}`
  };
}