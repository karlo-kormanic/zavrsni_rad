// components/CountdownBar.tsx
'use client';

import { useEffect, useState } from 'react';

interface CountdownBarProps {
  duration: number;
  onComplete?: () => void;
  active: boolean;
}

export default function CountdownBar({ duration, onComplete, active }: CountdownBarProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!active) return;

    setRemaining(duration);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, active, onComplete]);

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