import { Slide, State, Action } from '@/../../types'

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_SLIDE': {
            const newSlide: Slide = {
                id: state.slides.length + 1,
                questionType: 'multiple_choice',
                options: ['', '', '', ''],
                answer: '',
                note: '',
            };
            return {
                ...state,
                slides: [...state.slides, newSlide],
                activeSlideId: newSlide.id,
            };
        }
        
        case 'SET_ACTIVE_SLIDE':
            return { ...state, activeSlideId: action.id };

        case 'UPDATE_SLIDE':
            return {
                ...state,
                slides: state.slides.map((slide) =>
                slide.id === action.id ? { ...slide, ...action.payload } : slide
                ),
            };

        case 'DELETE_SLIDE':
            return {
                ...state,
                slides: state.slides.filter(slide => slide.id !== action.id),
            };
        
        case 'SET_INITIAL_SLIDES':
            return {
                ...state,
                slides: action.payload,
                activeSlideId: action.payload.length > 0 ? action.payload[0].id : null,
            }

        default:
            throw new Error('Unknown action');
        
    }
};