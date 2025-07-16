import { supabase } from '@/lib/supabaseClient';

export async function createRoom() {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      room_code: roomCode,
      status: 'waiting',
      current_slide_index: 0,
      has_started: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}