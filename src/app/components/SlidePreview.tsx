'use client'

import { Slide } from '@/../../types';

interface SlidePreviewProps {
  slides: Slide[];
  activeSlideId: number;
  onSelectSlide: (id: number) => void;
  onAddSlide: () => void;
  onRemoveSlide: (id: number) => void;
}

const SlidePreview = ({
    slides,
    activeSlideId,
    onSelectSlide,
    onAddSlide,
    onRemoveSlide,
}: SlidePreviewProps) => {
    return (
        <div className="h-[83vh] p-2 bg-white rounded-lg shadow-md overflow-y-auto">
            <ul className="space-y-2">
                {slides.map((slide) => (
                <li
                    key={slide.id}
                    onClick={() => onSelectSlide(slide.id)}
                    className={`p-3 rounded cursor-pointer border ${
                    slide.id === activeSlideId
                        ? 'bg-blue-100 border-blue-500 font-semibold'
                        : 'hover:bg-gray-200'
                    }`}
                >
                    Slide {slide.id} — {slide.questionType.replace('_', ' ')}
                </li>
                ))}
            </ul>
            <br></br>
            <button
                onClick={onAddSlide}
                className="w-full bg-blue-500 text-white px-3 py-2 mb-4 rounded hover:bg-blue-600 transition"
            >
                + Add Slide
            </button>
            <button
                onClick={() => {
                    const lastSlide = slides[slides.length - 1];
                    if(lastSlide) {
                        onRemoveSlide(lastSlide.id);
                    }
                }}
                className="w-full bg-blue-500 text-white px-3 py-2 mb-4 rounded hover:bg-blue-600 transition"
            >
                + Remove Last Slide
            </button>
        </div>
    )
}

export default SlidePreview;