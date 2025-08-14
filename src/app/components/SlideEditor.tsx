'use client';

import { useEffect, useReducer, useState } from 'react';
import { reducer } from '@/reducers/SlideReducer';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [quizTitle, setQuizTitle] = useState('Loading quiz...');
    const [state, dispatch] = useReducer(reducer, { 
        slides: [],
        activeSlideId: null,
    });

    // 1. Check authentication first
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error || !user) {
                router.push('/login');
                return;
            }
            
            setAuthChecked(true);
        };

        checkAuth();
    }, [router]);

    // 2. Load data after auth is confirmed
    useEffect(() => {
        if (!authChecked) return;

        const loadAllData = async () => {
            try {
                // Fetch quiz title and slides in parallel
                const [{ data: quizData }, slides] = await Promise.all([
                    supabase
                        .from('quizzes')
                        .select('title')
                        .eq('id', quizId)
                        .single(),
                    fetchSlides(quizId)
                ]);

                setQuizTitle(quizData?.title || 'Untitled Quiz');
                dispatch({ type: 'SET_INITIAL_SLIDES', payload: slides });

                // Debug log
                const { data } = await supabase
                    .from('slides')
                    .select('id,quiz_id,question')
                    .eq('quiz_id', quizId);
                console.log('Host-side slides:', data);
            } catch (error) {
                console.error('Failed to load data:', {
                    error,
                    quizId,
                    stack: new Error().stack
                });
                router.push('/dashboard');
            }
        };

        loadAllData();
    }, [quizId, authChecked, router]);

    const updateQuizTitle = async (newTitle: string) => {
        try {
            const { error } = await supabase
                .from('quizzes')
                .update({ title: newTitle })
                .eq('id', quizId);

            if (error) throw error;
            setQuizTitle(newTitle);
        } catch (error) {
            console.error('Failed to update quiz title:', error);
            throw error;
        }
    };

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

            dispatch({ type: 'SET_ACTIVE_SLIDE', id: savedSlide.id });
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

    if (!authChecked) {
        return <div>Checking authentication...</div>;
    }

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
            <div className="flex-1 grid grid-rows-[auto_minmax(0,1fr)_auto] p-3 gap-3">
                <QuizHeader quizId={quizId} quizTitle={quizTitle} onTitleUpdate={updateQuizTitle} />
                {activeSlide && (
                    <SlideQuestionArea
                        slide={activeSlide}
                        onUpdate={async (payload) => {
                            try {
                                const updatedSlide = { ...activeSlide, ...payload };
                                await saveSlide(updatedSlide);
                                dispatch({ 
                                    type: 'UPDATE_SLIDE', 
                                    id: activeSlide.id,
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
    );
};

export default SlideEditor;