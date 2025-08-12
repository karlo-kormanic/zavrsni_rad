'use client';

import { useState, useEffect, useRef } from 'react';

interface QuestionPromptProps {
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
}: QuestionPromptProps) {
  const [value, setValue] = useState(initialValue);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasChanged, setHasChanged] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initialValue);
    setSaveStatus('idle');
    setHasChanged(false);
  }, [initialValue]);

  useEffect(() => {
    if (!hasChanged || value === initialValue) return;

    setSaveStatus('saving');

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      onSave(value);
      setSaveStatus('saved');

      idleTimerRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [value, initialValue, onSave, hasChanged]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!hasChanged) setHasChanged(true);
    setValue(e.target.value);
  };

  return (
    <div className={`relative h-full ${className}`}>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="absolute inset-0 p-2 border rounded-md overflow-y-auto resize-none"
        rows={3}
      />
      {saveStatus !== 'idle' && (
        <span
          className={`absolute right-2 bottom-2 text-xs ${
            saveStatus === 'saved' ? 'text-green-500' : 'text-gray-500'
          }`}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
        </span>
      )}
    </div>
  );
}
