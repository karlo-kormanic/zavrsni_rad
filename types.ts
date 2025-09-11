export type OptionPrefixPattern = (index: number) => string;

export type Quiz = {
  id: string;
  title: string;
  description?: string;
  host_id: string;
  created_at: string;
  updated_at: string;
  slides_count?: number;
};

export type Slide = {
    id: number;
    question?: string;
    questionType: string;
    options: string[];
    answer: string | string[] | number | number[];
    note?: string;
    quiz_id: string;
    host_id: string;
    created_at?: string;
}

export type State = {
  slides: Slide[];
  activeSlideId: number | null;
};

export type Action =
  | { type: 'ADD_SLIDE'; payload: Slide }
  | { type: 'SET_ACTIVE_SLIDE'; id: number }
  | { type: 'UPDATE_SLIDE'; id: number; payload: Partial<Omit<Slide, 'quiz_id' | 'host_id'>> }
  | { type: 'DELETE_SLIDE'; id: number }
  | { type: 'SET_INITIAL_SLIDES'; payload: Slide[] }

export type Room = {
  id: string;
  room_code: string;
  status: string;
  current_slide_index: number;
  created_at: string;
  has_started?: boolean;
  quiz_id: string;
  host_id: string;
  winner_count: number;
  auto_advance: boolean; 
  slide_duration: number; 
};

export type PlayerResponse = {
  id: number;
  room_id: number;
  slide_id: number;
  player_name: string;
  selected_option: string;
  created_at: string;
};