const QuizHeader = () => {
    return (
        <div className="flex justify-between p-3">
            <h1 className="text-xl font-bold mb-2 pt-3">Matematički kviz #3</h1>
            <div className="w-1/5">
                <a className="text-sm font-medium text-indigo-600 focus:ring-3 focus:outline-hidden" href="#">
                    <span className="relative block border border-current bg-white px-8 py-3"> Start the quiz </span>
                </a>
            </div>
        </div>
    )
}

export default QuizHeader;