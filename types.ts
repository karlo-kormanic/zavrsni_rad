export type OptionPrefixPattern = (index: number) => string;

export type Slide = {
  id: number;
  question?: string;
  questionType: string;
  options: string[];
  answer: string | string[] | number | number[];
  note?: string;
};

export type State = {
  slides: Slide[];
  activeSlideId: number | null;
};

export type Action =
  | { type: 'ADD_SLIDE' }
  | { type: 'SET_ACTIVE_SLIDE'; id: number }
  | { type: 'UPDATE_SLIDE'; id: number; payload: Partial<Slide> }
  | { type: 'DELETE_SLIDE'; id: number }
  | { type: 'SET_INITIAL_SLIDES'; payload: Slide[] }

export type Room = {
  id: number;
  room_code: string;
  status: string;
  current_slide_index: number;
  created_at: string;
  has_started?: boolean;
  // quiz_id?: number;
};