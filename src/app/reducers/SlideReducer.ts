import { State, Action } from '@/../../types'

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_SLIDE':
            return {
                ...state,
                slides: [...state.slides, action.payload],
                activeSlideId: action.payload.id,
            };
        
        case 'SET_ACTIVE_SLIDE':
            return { 
                ...state, 
                activeSlideId: action.id 
            };

        case 'UPDATE_SLIDE':
            return {
                ...state,
                slides: state.slides.map((slide) =>
                    slide.id === action.id ? { 
                        ...slide, 
                        ...action.payload,
                        quiz_id: slide.quiz_id,
                        host_id: slide.host_id
                    } : slide
                ),
            };

        case 'DELETE_SLIDE': {
            const newSlides = state.slides.filter(slide => slide.id !== action.id);
            return {
                ...state,
                slides: newSlides,
                activeSlideId: state.activeSlideId === action.id ? 
                    (newSlides[0]?.id || null) : 
                    state.activeSlideId
            };
        }
        
        case 'SET_INITIAL_SLIDES':
            return {
                ...state,
                slides: action.payload,
                activeSlideId: action.payload[0]?.id || null,
            };

        default: {
            const unexpectedAction: never = action;
            throw new Error(`Unknown action: ${unexpectedAction}`);
        }
    }
};