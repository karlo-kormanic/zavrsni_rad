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
        {value: 'multiple_choice', label: 'Multiple Choice'},
        {value: 'checkbox', label: 'Checkbox'},
        {value: 'scale', label: 'Scale'},
    ];

    useEffect(() => {
        if (questionType === 'scale') {
            // For scale questions, ensure 6 options
            setOptions(prev => {
                const newOptions = [...prev];
                while (newOptions.length < 6) newOptions.push('');
                while (newOptions.length > 6) newOptions.pop();
                return newOptions;
            });
        } else {
            // For other types, ensure 4 options
            setOptions(prev => {
                const newOptions = [...prev];
                while (newOptions.length < 4) newOptions.push('');
                while (newOptions.length > 4) newOptions.pop();
                return newOptions;
            });
        }
    }, [questionType]);

    const handleTypeChange = (selectedValue: string) => {
        setQuestionType(selectedValue);
        // Don't reset options here - let useEffect handle it
        setAnswer('');
    };

    return (
        <div className="relative h-[55vh] row-span-1 bg-white border border-gray-300 p-4">
            {/* Top row - question and type selector */}
            <div className="flex justify-between mb-6">
                <div className="w-1/2 pr-2">
                    <QuestionPrompt
                        onSave={() => console.log("Question saved.")}
                    />
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

            {/* Middle content */}
            <div className="mb-6">
                <div className="w-full">
                    <AnswerEditor
                        initialOptions={options}
                        onUpdate={setOptions}
                        optionPrefixPattern={
                            questionType === 'scale' 
                                ? (index) => `${index + 1}.`
                                : undefined
                        }
                    />
                    {/* Show selector if any option is non-empty */}
                    {options.filter(opt => opt.trim() !== '').length > 0 && (
                        <AnswerSelector
                            options={options} 
                            selectedAnswer={answer}
                            selectedAnswers={answers}
                            onSelect={(option) => {
                                if (questionType === 'checkbox') {
                                setAnswers(option as string[]);
                                } else {
                                setAnswer(option as string);
                                }
                            }}
                            optionPrefixPattern={
                            questionType === 'scale' 
                                ? (index) => `${index + 1}.`
                                : undefined
                            }
                            multiSelect={questionType === 'checkbox'}
                        />
                    )}
                </div>
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
