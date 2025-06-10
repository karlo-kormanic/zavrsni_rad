'use client';

import  { useReducer } from 'react';
import { reducer } from '@/reducers/SlideReducer';
import NoteArea from "@/components/NoteArea";
import SlideQuestionArea from "@/components/SlideQuestionArea";
import QuizHeader from "@/components/QuizHeader";
import SlidePreview from '@/components/SlidePreview';

const SlideEditor = () => {
    const [state, dispatch] = useReducer(reducer, { 
        slides: [
            {
                id: 1,
                questionType: 'multiple_choice',
                options: ['', '', '', ''],
                answer: '',
            },
        ],
        activeSlideId: 1,
     });

    const activeSlide = state.slides.find((s) => s.id === state.activeSlideId);

    return (
        <div className="h-[84vh] col-span-17 bg-white border border-gray-300 flex">
            <div className="w-40 gap-2">
                <SlidePreview
                    slides={state.slides}
                    activeSlideId={state.activeSlideId}
                    onSelectSlide={(id) => dispatch({ type: 'SET_ACTIVE_SLIDE', id})}
                    onAddSlide={() => dispatch({ type: 'ADD_SLIDE' })}
                />
            </div>
            <div className="flex-1 grid grid-rows-[auto_1fr_auto_auto] p-3 gap-3">
                <QuizHeader/>
                {activeSlide && (
                    <SlideQuestionArea
                        slide={activeSlide}
                        onUpdate={(payload) =>
                            dispatch({ type: 'UPDATE_SLIDE', id: activeSlide.id, payload})
                        }
                    />
                )}
                {activeSlide && (
                    <NoteArea
                        note={activeSlide.note ?? ''}
                        onChange={(note) =>
                        dispatch({ type: 'UPDATE_SLIDE', id: activeSlide.id, payload: { note } })
                        }
                    />
                )}
            </div>
        </div>
    )
}

export default SlideEditor;

//TODO one quiz = multiple slides = one JSON structure