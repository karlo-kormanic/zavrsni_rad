import { supabase } from '@/lib/supabaseClient';
import { Slide } from '@/../../types';

export async function saveSlide(slide: Slide) {
  const { data, error } = await supabase
    .from('slides')
    .upsert([slide], { onConflict: 'id' });

  if (error) throw error;
  return data;
}

export async function fetchSlides() {
  const { data, error } = await supabase.from('slides').select('*').order('id', { ascending: true });
  if (error) throw error;
  return data;
}

export async function deleteSlide(id: number) {
  const { error } = await supabase.from('slides').delete().eq('id', id);
  if (error) throw error;
}
