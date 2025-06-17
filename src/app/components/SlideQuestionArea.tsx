'use client';
import QuestionPrompt from '@/components/QuestionPrompt';
import QuestionTypeDropdown from '@/components/QuestionTypeDropdown';
import { AnswerEditor } from '@/components/AnswerEditor';
import { AnswerSelector } from '@/components/AnswerSelector';
import { Slide } from '@/../../types';

type SlideQuestionAreaProps = {
  slide: Slide;
  onUpdate: (payload: Partial<Slide>) => void;
};

const SlideQuestionArea = ({ slide, onUpdate }: SlideQuestionAreaProps) => {
  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'scale', label: 'Scale' },
  ];

  const handleTypeChange = (selectedValue: string) => {
    const requiredLength = selectedValue === 'scale' ? 6 : 4;
    const newOptions = [...slide.options];

    while (newOptions.length < requiredLength) newOptions.push('');
    while (newOptions.length > requiredLength) newOptions.pop();

    const newAnswer = selectedValue === 'checkbox' ? [] : '';

    onUpdate({
      questionType: selectedValue,
      options: newOptions,
      answer: newAnswer,
    });
  };

  return (
    <div className="relative h-[55vh] bg-white border border-gray-300 p-4">
      <div className="flex justify-between mb-6">
        <div className="w-1/2 pr-2">
          <QuestionPrompt
            initialValue={slide.question || ''}
            onSave={(newQuestion) => onUpdate({ question: newQuestion })}
            placeholder="Type your question..."
          />
        </div>
        <div className="w-1/2 pl-2">
          <QuestionTypeDropdown
            options={questionTypes}
            selectedValue={slide.questionType}
            onChange={handleTypeChange}
            placeholder="Question Type"
          />
        </div>
      </div>

      <div className="mb-6">
        <AnswerEditor
          initialOptions={slide.options}
          onUpdate={(newOptions) => onUpdate({ options: newOptions })}
          optionPrefixPattern={
            slide.questionType === 'scale' ? (index) => `${index + 1}.` : undefined
          }
        />

        {slide.options.filter((opt) => opt.trim() !== '').length > 0 && (
          <AnswerSelector
            options={slide.options}
            selectedAnswer={typeof slide.answer === 'number' ? slide.answer : ''}
            selectedAnswers={
              Array.isArray(slide.answer) && slide.answer.every((a) => typeof a === 'number') 
                ? (slide.answer as number[]) 
                : []
            }
            isMultiSelect={slide.questionType === 'checkbox'}
            isSortable={slide.questionType === 'scale'}
            onSelect={(value) => {
              if (slide.questionType === 'checkbox') {
                onUpdate({ answer: value as number[] });  // store indices
              } else {
                onUpdate({ answer: value as string });
              }
            }}
            onReorder={(newOptions) => onUpdate({ options: newOptions })}
            optionPrefixPattern={
              slide.questionType === 'scale' ? (index) => `${index + 1}.` : undefined
            }
          />
        )}
      </div>
    </div>
  );
};

export default SlideQuestionArea;
