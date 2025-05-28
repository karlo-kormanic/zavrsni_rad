'use client';

import { useState } from 'react';
import QuestionTypeDropdown from './QuestionTypeDropdown';
import QuestionPrompt from './QuestionPrompt';
import MultipleChoice from './MultipleChoice';

const QuestionEditor = () => {

    const [questionType, setQuestionType] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [mcOptions, setMcOptions] = useState<string[]>([]);

    const questionTypes = [
        {value: 'multiple_choice', label: 'Multiple Choice'},
        {value: 'checkbox', label: 'Checkbox'},
        {value: 'scale', label: 'Scale'},
    ]

    const handleTypeChange = (selectedValue: string) => {
        setQuestionType(selectedValue);
    }

    return (
        //TODO add question window expansion on new line in type your question...
        //TODO add data persistence (until hard refresh) -> should I even do this if db saving fixes this problem?
        //TODO change saves to lower the amount of db calls, onChange -> onBlur
        <div className="relative h-[55vh] row-span-1 bg-white border border-gray-300 p-4">
            {/* Top row - question and type selector */}
            <div className="flex justify-between mb-6">
                <div className="w-1/2 pr-2">
                    <QuestionPrompt
                        onSave={() => {
                            console.log("Question saved.")
                        }}
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

            {/* Middle content - dynamic based on question type */}
            <div className="mb-6">
                {questionType === 'multiple_choice' && (
                    <div className="w-full">
                        <MultipleChoice onUpdate={setMcOptions} />
                    </div>
                )}
            </div>

            {/* Bottom - answer hint */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <a className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-none" href="#">
                    <span className="relative block border border-current bg-white px-8 py-3">
                        The answer to question 3 is...
                    </span>
                </a>
            </div>
        </div>
    )
}

export default QuestionEditor;