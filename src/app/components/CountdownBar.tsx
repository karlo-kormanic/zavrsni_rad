'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface CountdownBarProps {
  duration: number;
  active: boolean;
  onComplete?: () => void;
  slideIndex: number;
}

export default function CountdownBar({ 
  duration, 
  active, 
  onComplete,
  slideIndex
}: CountdownBarProps) {
  const [remaining, setRemaining] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number>(Date.now() + duration * 1000);
  const prevSlideRef = useRef<number>(slideIndex);
  const prevDurationRef = useRef<number>(duration);

  const timerCallback = useCallback(() => {
    if (!endTimeRef.current) return;
    
    const now = Date.now();
    const newRemaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
    
    setRemaining(newRemaining);

    if (newRemaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Reset timer references
    if (slideIndex !== prevSlideRef.current || duration !== prevDurationRef.current) {
      prevSlideRef.current = slideIndex;
      prevDurationRef.current = duration;
      endTimeRef.current = Date.now() + duration * 1000;
      setRemaining(duration);
    }

    // Start new interval
    timerRef.current = setInterval(timerCallback, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, duration, slideIndex, timerCallback]);

  if (!active) return null;

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-500">Time remaining:</span>
        <span className="text-xs font-semibold text-gray-700">{remaining}s</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear" 
          style={{ width: `${(remaining / duration) * 100}%` }}
        />
      </div>
    </div>
  );
}