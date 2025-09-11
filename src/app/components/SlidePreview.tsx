'use client'
import { Slide } from '@/../../types';
import { useState } from 'react';

interface SlidePreviewProps {
  slides: Slide[];
  activeSlideId: number | null;
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
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeletingId(id);
    if (window.confirm('Are you sure you want to delete this question?')) {
      onRemoveSlide(id);
    }
    setDeletingId(null);
  };

  return (
    <div className="h-[83vh] p-2 bg-white rounded-lg shadow-md overflow-y-auto flex flex-col">
      {slides.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-center">No questions yet</p>
          <p className="text-sm text-center mt-1">Add your first question to get started</p>
        </div>
      ) : (
        <ul className="space-y-2 flex-1 overflow-y-auto">
          {slides.map((slide, index) => (
            <li
              key={slide.id}
              onClick={() => onSelectSlide(slide.id)}
              className={`relative p-3 rounded cursor-pointer border min-h-[72px] flex items-center ${
                slide.id === activeSlideId
                  ? 'bg-blue-100 border-blue-500 font-semibold'
                  : 'hover:bg-gray-200'
              } ${deletingId === slide.id ? 'opacity-50' : ''}`}
            >
              <div 
                className="pr-6 flex-1 line-clamp-3" 
                title={slide.question || `Question ${index + 1}`}
              >
                {slide.question || `Question ${index + 1}`}
              </div>
              
              <button
                onClick={(e) => handleDelete(e, slide.id)}
                disabled={deletingId === slide.id}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 disabled:opacity-50"
                aria-label="Delete slide"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onAddSlide}
        className="w-full bg-blue-500 text-white px-3 py-2 mt-4 rounded hover:bg-blue-600 transition disabled:opacity-50"
        disabled={deletingId !== null}
      >
        + Add a Question
      </button>
    </div>
  )
}

export default SlidePreview;