'use client';
import { useState, useEffect } from 'react';
import QuestionPrompt from './QuestionPrompt';
import QuestionTypeDropdown from './QuestionTypeDropdown';
import { AnswerEditor } from './AnswerEditor';
import { AnswerSelector } from './AnswerSelector';

const SlideQuestionArea = () => {
  const [questionType, setQuestionType] = useState<string>('multiple_choice');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'scale', label: 'Scale' },
  ];

  useEffect(() => {
    setOptions((prev) => {
      const newOptions = [...prev];
      const targetLength = questionType === 'scale' ? 6 : 4;
      while (newOptions.length < targetLength) newOptions.push('');
      while (newOptions.length > targetLength) newOptions.pop();
      return newOptions;
    });
    setAnswer('');
    setAnswers([]);
  }, [questionType]);

  const handleTypeChange = (selectedValue: string) => {
    setQuestionType(selectedValue);
  };

  return (
    <div className="relative h-[55vh] bg-white border border-gray-300 p-4">
      <div className="flex justify-between mb-6">
        <div className="w-1/2 pr-2">
          <QuestionPrompt onSave={() => console.log("Question saved.")} />
        </div>
        <div className="w-1/2 pl-2">
          <QuestionTypeDropdown
            options={questionTypes}
            selectedValue={questionType}
            onChange={handleTypeChange}
            placeholder="Question Type"
          />
        </div>
      </div>

      <div className="mb-6">
        <AnswerEditor
          initialOptions={options}
          onUpdate={setOptions}
          optionPrefixPattern={
            questionType === 'scale' ? (index) => `${index + 1}.` : undefined
          }
        />

        {options.filter(opt => opt.trim() !== '').length > 0 && (
          <AnswerSelector
            options={options}
            selectedAnswer={answer}
            selectedAnswers={answers}
            isMultiSelect={questionType === 'checkbox'}
            isSortable={questionType === 'scale'}
            onSelect={(value) => {
              if (questionType === 'checkbox') {
                setAnswers(value as string[]);
              } else {
                setAnswer(value as string);
              }
            }}
            onReorder={setOptions}
            optionPrefixPattern={
              questionType === 'scale' ? (index) => `${index + 1}.` : undefined
            }
          />
        )}
      </div>
    </div>
  );
};

export default SlideQuestionArea;
//TODO add question window expansion on new line in type your question...
//TODO change saves to lower the amount of db calls, onChange -> onBlur
//TODO browse the files and change local import path to global
//TODO browse the files and unify export default function look
//TODO change the answer is button into dropdown that loads the answers and lets user pick 1, pick multiple or adjust the order
