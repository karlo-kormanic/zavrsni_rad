import { supabase } from '@/lib/supabaseClient';
import { Slide } from '@/../../types';

export async function saveSlide(slide: Slide) {
  const { data, error } = await supabase
    .from('slides')
    .upsert(slide)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const fetchSlides = async (quizId: string) => {
  try {
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      console.warn('No slides found for quiz:', quizId);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch slides:', error);
    throw error; // Re-throw for error boundaries
  }
};

export async function deleteSlide(id: number) {
  const { error } = await supabase.from('slides').delete().eq('id', id);
  if (error) throw error;
}
