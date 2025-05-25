'use client'

import { useState } from 'react';
import QuestionTypeDropdown from './QuestionTypeDropdown';

const QuestionEditor = () => {

    const [questionType, setQuestionType] = useState<string | null>(null);

    const questionTypes = [
        {value: 'multiple_choice', label: 'Multiple Choice'},
        {value: 'checkbox', label: 'Checkbox'},
        {value: 'scale', label: 'Scale'},
    ]

    const handleTypeChange = (selectedValue: string) => {
        setQuestionType(selectedValue);
    }

    return(
        <div className="relative h-[55vh] row-span-1 bg-white border border-gray-300">
            <div className="w-3/7 absolute left-10 top-1/2 transform -translate-y-1/2">
                <a className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden" href="#">
                    <span className="relative block border border-current bg-white px-8 py-3"> Click to start typing question 3...</span>
                </a>
            </div>
            <div className="w-3/7 absolute right-10 top-1/2 transform -translate-y-1/2">
                <QuestionTypeDropdown
                    options={questionTypes} 
                    selectedValue={questionType}
                    onChange={handleTypeChange}
                    placeholder="Question Type"   
                />
            </div>
            <div className="absolute left-1/2 bottom-30 transform -translate-x-1/2">
                <a className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden" href="#">
                    <span className="relative block border border-current bg-white px-8 py-3"> The answer to question 3 is...</span>
                </a>
            </div>
        </div>
    )
}

export default QuestionEditor;