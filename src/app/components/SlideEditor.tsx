'use client';

import  { useEffect, useReducer } from 'react';
import { reducer } from '@/reducers/SlideReducer';
import NoteArea from "@/components/NoteArea";
import SlideQuestionArea from "@/components/SlideQuestionArea";
import QuizHeader from "@/components/QuizHeader";
import SlidePreview from '@/components/SlidePreview';
import { saveSlide, deleteSlide } from '@/services/slideService';
import { fetchSlides } from '@/services/slideService';

const SlideEditor = () => {
    const [state, dispatch] = useReducer(reducer, { 
        slides: [],
        activeSlideId: null,
    });

    const activeSlide = state.slides.find((s) => s.id === state.activeSlideId);

    const handleAddSlide = async () => {
        const newSlide = {
            id: state.slides.length + 1,
            questionType: 'multiple_choice',
            options: ['', '', '', ''],
            answer: '',
            note: '',
        };

        try {
            await saveSlide(newSlide);
            dispatch({ type: 'ADD_SLIDE' });
        } catch (error) {
            console.error('Failed to save new slide:', error);
            // optionally show user error UI here
        }
    };

    const handleRemoveSlide = async (id: number) => {
        try {
            await deleteSlide(id);
            dispatch({ type: 'DELETE_SLIDE', id });
        } catch (error) {
            console.error('Failed to delete slide:', error);
            // optionally show user error UI here
        }
    };

    useEffect(() => {
        const loadSlides = async () => {
            try {
            const slides = await fetchSlides();
            dispatch({ type: 'SET_INITIAL_SLIDES', payload: slides });
            } catch (error) {
            console.error('Failed to load slides:', error);
            }
        };

        loadSlides();
    }, []);

    return (
        <div className="h-[84vh] col-span-17 bg-white border border-gray-300 flex">
            <div className="w-40 gap-2">
                <SlidePreview
                    slides={state.slides}
                    activeSlideId={state.activeSlideId}
                    onSelectSlide={(id) => dispatch({ type: 'SET_ACTIVE_SLIDE', id})}
                    onAddSlide={handleAddSlide}
                    onRemoveSlide={() => {
                        if (state.activeSlideId !== null) {
                            handleRemoveSlide(state.activeSlideId);
                        }
                    }}
                />
            </div>
            <div className="flex-1 grid grid-rows-[auto_1fr_auto_auto] p-3 gap-3">
                <QuizHeader/>
                {activeSlide && (
                    <SlideQuestionArea
                        slide={activeSlide}
                        onUpdate={async (payload) =>{
                            try {
                                const updatedSlide = { ...activeSlide, ...payload };
                                await saveSlide(updatedSlide);
                                dispatch({ type: 'UPDATE_SLIDE', id: activeSlide.id, payload });
                            } catch (error) {
                                console.error('Failed to update slide:', error);
                            }
                        }}
                    />
                )}
                {activeSlide && (
                    <NoteArea
                        note={activeSlide.note ?? ''}
                        onChange={async (note) => {
                            try {
                                const updatedSlide = { ...activeSlide, note };
                                await saveSlide(updatedSlide);
                                dispatch({ type: 'UPDATE_SLIDE', id: activeSlide.id, payload: { note } });
                            } catch (error) {
                                console.error('Failed to update note:', error);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default SlideEditor;

//TODO one quiz = multiple slides = one JSON structure