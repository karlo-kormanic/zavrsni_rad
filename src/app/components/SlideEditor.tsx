import NoteArea from "./NoteArea";
import SlideQuestionArea from "./SlideQuestionArea";
import QuizHeader from "./QuizHeader";

const SlideEditor = () => {
    return (
        <div className="h-[76vh] col-span-14 bg-white border border-gray-300">
            <QuizHeader/>
            <div className="grid grid-rows-2 p-3 gap-3">
                <SlideQuestionArea/>
                <NoteArea/>
            </div>
        </div>
    )
}

export default SlideEditor;