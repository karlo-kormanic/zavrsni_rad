'use client'; // Required for interactivity

import { useState } from 'react';

interface DropdownProps {
  options: { value: string; label: string }[];
  selectedValue: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function QuestionTypeDropdown({
  options,
  selectedValue,
  onChange,
  placeholder = '',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = selectedValue
    ?options.find(opt => opt.value === selectedValue)?.label
    :placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="w-full p-2 border rounded-md flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption}
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className="w-full text-left p-2 hover:bg-gray-100"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}