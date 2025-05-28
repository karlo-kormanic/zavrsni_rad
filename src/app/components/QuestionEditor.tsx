'use client';
import { useState, useEffect } from 'react';
import type { OptionPrefixPattern } from '@/../../types';

interface EditorProps {
  initialOptions?: string[];
  onUpdate: (options: string[]) => void;
  optionPrefixPattern?: OptionPrefixPattern;
}

interface OptionInputProps {
  index: number;
  option: string;
  prefix: string;
  onChange: (value: string) => void;
}

interface AddOptionButtonProps {
  onClick: () => void;
}

const OptionInput = ({ index, option, prefix, onChange }: OptionInputProps) => (
  <div className="flex items-center gap-2">
    <span className="w-6 text-gray-500 font-medium">{prefix}</span>
    <input
      type="text"
      value={option}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-transparent"
      placeholder={`Option ${index + 1}`}
    />
  </div>
);

const AddOptionButton = ({ onClick }: AddOptionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-3 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
  >
    + Add Option
  </button>
);

export function QuestionEditor({
  initialOptions = ['', '', '', ''],
  onUpdate,
  optionPrefixPattern = (index) => `${String.fromCharCode(97 + index)})`,
}: EditorProps) {
  const [options, setOptions] = useState<string[]>(initialOptions);

  const handleChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(options.filter(opt => opt.trim() !== ''));
    }, 500);
    return () => clearTimeout(timer);
  }, [options, onUpdate]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => (
          <OptionInput
            key={index}
            index={index}
            option={option}
            prefix={optionPrefixPattern(index)}
            onChange={(value) => handleChange(index, value)}
          />
        ))}
      </div>
      <AddOptionButton onClick={addOption} />
    </>
  );
}