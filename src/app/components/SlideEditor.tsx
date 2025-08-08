'use client';

import { useEffect, useReducer } from 'react';
import { reducer } from '@/reducers/SlideReducer';
import NoteArea from "@/components/NoteArea";
import SlideQuestionArea from "@/components/SlideQuestionArea";
import QuizHeader from "@/components/QuizHeader";
import SlidePreview from '@/components/SlidePreview';
import { saveSlide, deleteSlide, fetchSlides } from '@/services/slideService';
import { supabase } from '@/lib/supabaseClient';

interface SlideEditorProps {
    quizId: string;
}

const SlideEditor = ({ quizId }: SlideEditorProps) => {
    const [state, dispatch] = useReducer(reducer, { 
        slides: [],
        activeSlideId: null,
    });

    const activeSlide = state.slides.find((s) => s.id === state.activeSlideId);

    const handleAddSlide = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const newSlide = {
                questionType: 'multiple_choice',
                options: ['', '', '', ''],
                answer: 0,
                note: '',
                quiz_id: quizId,
                host_id: user.id
            };

            const { data: savedSlide, error } = await supabase
                .from('slides')
                .insert(newSlide)
                .select()
                .single();

            if (error) throw error;
            dispatch({ type: 'ADD_SLIDE', payload: savedSlide });
        } catch (error) {
            console.error('Failed to add slide:', error);
        }
    };

    const handleRemoveSlide = async (id: number) => {
        try {
            await deleteSlide(id);
            dispatch({ type: 'DELETE_SLIDE', id });
        } catch (error) {
            console.error('Failed to delete slide:', error);
        }
    };

    useEffect(() => {
        const loadSlides = async () => {
            try {
            console.log('Fetching slides for quiz:', quizId); // Debug log
            const slides = await fetchSlides(quizId);
            console.log('Received slides:', slides); // Debug log
            dispatch({ type: 'SET_INITIAL_SLIDES', payload: slides });
            } catch (error) {
            console.error('Failed to load slides:', {
                error,
                quizId,
                stack: new Error().stack // Get call stack
            });
            }
        };


        loadSlides();
    }, [quizId]); // Added quizId as dependency

    useEffect(() => {
        const logSlides = async () => {
            const { data } = await supabase
            .from('slides')
            .select('id,quiz_id,question')
            .eq('quiz_id', quizId); // quizId from props
            
            console.log('Host-side slides:', data);
        };
        logSlides();
    }, [quizId]);

    return (
        <div className="h-[84vh] col-span-17 bg-white border border-gray-300 flex">
            <div className="w-40 gap-2">
                <SlidePreview
                    slides={state.slides}
                    activeSlideId={state.activeSlideId}
                    onSelectSlide={(id) => dispatch({ type: 'SET_ACTIVE_SLIDE', id })}
                    onAddSlide={handleAddSlide}
                    onRemoveSlide={() => {
                        if (state.activeSlideId !== null) {
                            handleRemoveSlide(state.activeSlideId);
                        }
                    }}
                />
            </div>
            <div className="flex-1 grid grid-rows-[auto_1fr_auto_auto] p-3 gap-3">
                <QuizHeader quizId={quizId} />
                {activeSlide && (
                    <SlideQuestionArea
                        slide={activeSlide}
                        onUpdate={async (payload) => {
                            try {
                                const updatedSlide = { ...activeSlide, ...payload };
                                await saveSlide(updatedSlide);
                                dispatch({ 
                                    type: 'UPDATE_SLIDE', 
                                    id: activeSlide.id, // Fixed: using activeSlide.id
                                    payload 
                                });
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
                                dispatch({ 
                                    type: 'UPDATE_SLIDE', 
                                    id: activeSlide.id, 
                                    payload: { note } 
                                });
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