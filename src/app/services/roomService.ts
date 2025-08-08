import { supabase } from '@/lib/supabaseClient';

export async function createRoom(quizId: string, hostId: string) {

  console.log('Creating room with:', { quizId, hostId });

  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      room_code: roomCode,
      status: 'waiting',
      current_slide_index: 0,
      has_started: false,
      quiz_id: quizId,
      host_id: hostId
    })
    .select()
    .single();
  
  console.log('Room creation response:', { data, error });
  
  if (error) throw error;
  return data;
}