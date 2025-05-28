'use client';

import QuestionPrompt from "./QuestionPrompt";

const NoteArea = () => {
    return (
        <div className="h-[calc(12vh)] row-span-1 bg-white border border-gray-300">
            <QuestionPrompt
                onSave={() => {
                    console.log("Note saved.")
                }}
                //className="text-xl font-bold mb-2 p-2"
                placeholder="Add a note for the slide"
            />
        </div>
    )
}

export default NoteArea;