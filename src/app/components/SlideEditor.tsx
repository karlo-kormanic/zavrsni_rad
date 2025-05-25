const SlideEditor = () => {
    return (
        <div className="h-[76vh] col-span-14 bg-white border border-gray-300">
            <div className="flex justify-between p-3">
                <h1 className="text-xl font-bold mb-2 pt-3">Matematički kviz #3</h1>
                <div className="w-1/5">
                    <a className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden" href="#">
                        <span className="relative block border border-current bg-white px-8 py-3"> Start the quiz </span>
                     </a>
                </div>
            </div>
            <div className="grid grid-rows-2 p-3 gap-3">
                {/* Slide editor main screen */}
                <div className="relative h-[55vh] row-span-1 bg-white border border-gray-300">
                    <div className="w-3/7 absolute left-10 top-1/2 transform -translate-y-1/2">
                        <a className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden" href="#">
                            <span className="relative block border border-current bg-white px-8 py-3"> Click to start typing question 3...</span>
                        </a>
                    </div>
                    <div className="w-3/7 absolute right-10 top-1/2 transform -translate-y-1/2">
                        <a className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden" href="#">
                            <span className="relative block border border-current bg-white px-8 py-3"> Question type dropdown</span>
                        </a>
                    </div>
                    <div className="absolute left-1/2 bottom-30 transform -translate-x-1/2">
                        <a className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden" href="#">
                            <span className="relative block border border-current bg-white px-8 py-3"> The answer to question 3 is...</span>
                        </a>
                    </div>
                </div>
                {/* Slide editor comment screen */}
                <div className="h-[calc(12vh)] row-span-1 bg-white border border-gray-300">
                    <h2 className="text-xl font-bold mb-2 p-2">Click to add note for the slide</h2>
                </div>
            </div>
        </div>
    )
}

export default SlideEditor;