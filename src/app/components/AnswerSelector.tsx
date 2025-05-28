'use client';
import type { OptionPrefixPattern } from '@/../../types';

interface SelectorProps {
  options: string[];
  selectedAnswer: string;
  onSelect: (answer: string) => void;
  prefixPattern?: OptionPrefixPattern;
}

export function AnswerSelector({
  options,
  selectedAnswer,
  onSelect,
  prefixPattern = (index) => `${String.fromCharCode(97 + index)})`,
}: SelectorProps) {
  const validOptions = options.filter(opt => opt.trim() !== '');

  if (validOptions.length === 0) return null;

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Correct Answer
      </label>
      <select
        value={selectedAnswer}
        onChange={(e) => onSelect(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select answer...</option>
        {validOptions.map((option, index) => (
          <option key={index} value={option}>
            {prefixPattern(index)} {option}
          </option>
        ))}
      </select>
    </div>
  );
}