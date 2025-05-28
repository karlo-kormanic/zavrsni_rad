'use client';
import { useState, useEffect } from 'react';

interface MultipleChoiceProps {
  initialOptions?: string[];
  onUpdate: (options: string[]) => void;
}

export default function MultipleChoice({
  initialOptions = ['', '', '', ''],
  onUpdate
}: MultipleChoiceProps) {
  const [options, setOptions] = useState<string[]>(initialOptions);

  // Debounce updates to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(options.filter(opt => opt.trim() !== ''));
    }, 500);
    return () => clearTimeout(timer);
  }, [options, onUpdate]);

  const handleChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-6 text-gray-500 font-medium">
              {String.fromCharCode(97 + index)})
            </span>
            <input
              type="text"
              value={option}
              onChange={(e) => handleChange(index, e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Option ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        className="mt-3 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
      >
        + Add Option
      </button>
    </div>
  );
}