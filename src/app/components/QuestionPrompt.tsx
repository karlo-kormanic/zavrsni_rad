'use client';

import { useState, useEffect } from 'react';

interface QuestionPrompt {
  initialValue?: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function QuestionPrompt({
  initialValue = '',
  onSave,
  placeholder = 'Type your question...',
  className = '',
}: QuestionPrompt) {
  const [value, setValue] = useState(initialValue);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (value === initialValue) return;

    setSaveStatus('saving');

    const timer = setTimeout(() => {
        onSave(value);
        setSaveStatus('saved');

        const resetTimer = setTimeout(() => {
            setSaveStatus('idle');
        }, 2000);

        return () => clearTimeout(resetTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, initialValue, onSave]);

  return (
    <div className={`relative h-full ${className}`}>
      <textarea
        value={value}
        onChange={(e) => {setValue(e.target.value)}}
        placeholder={placeholder}
        className="absolute inset-0 p-2 border rounded-md 
              overflow-y-auto resize-none"
        rows={3}
      />
      {saveStatus !== 'idle' && (
        <span className={`absolute right-2 bottom-2 text-xs ${
          saveStatus === 'saved' ? 'text-green-500' : 'text-gray-500'
        }`}>
          {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
        </span>
      )}
    </div>
  );
}