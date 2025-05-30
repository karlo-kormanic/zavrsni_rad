'use client';
import type { OptionPrefixPattern } from '@/../../types';

interface SelectorProps {
  options: string[];
  selectedAnswer: string;
  selectedAnswers?: string[];
  onSelect: (answerOrAnswers: string | string[]) => void;
  optionPrefixPattern?: OptionPrefixPattern;
  multiSelect?: boolean;
}

export function AnswerSelector({
  options,
  selectedAnswer = '',
  selectedAnswers = [],
  onSelect,
  optionPrefixPattern = (index) => `${String.fromCharCode(97 + index)})`,
  multiSelect = false,
}: SelectorProps) {
  const hasAtLeastOneNonEmpty = options.some(opt => opt.trim() !== '');
  if (!hasAtLeastOneNonEmpty) return null;

  if (multiSelect) {
    const handleToggle = (value: string) => {
      const updated = selectedAnswers.includes(value)
        ? selectedAnswers.filter((v) => v !== value)
        : [...selectedAnswers, value];
      onSelect(updated);
    };

    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answers:
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedAnswers.includes(option)}
                onChange={() => handleToggle(option)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>{optionPrefixPattern(index)} {option || '[empty]'}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Correct Answer:
      </label>
      <select
        value={selectedAnswer}
        onChange={(e) => onSelect(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select answer...</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {optionPrefixPattern(index)} {option}
          </option>
        ))}
      </select>
    </div>
  );
}