export type OptionPrefixPattern = (index: number) => string;

export type Slide = {
  id: number;
  questionType: string;
  options: string[];
  answer: string | string[];
  note?: string;
};

export type State = {
  slides: Slide[];
  activeSlideId: number;
};

export type Action =
  | { type: 'ADD_SLIDE' }
  | { type: 'SET_ACTIVE_SLIDE'; id: number }
  | { type: 'UPDATE_SLIDE'; id: number; payload: Partial<Slide> };