const SlidePreview = () => {
    return (
        <div className="col-span-3 h-[76vh] bg-white rounded-lg shadow-md overflow-y-auto">
            <div className="flex flex-col items-center gap-4 p-4 min-h-screen">
            <div className="border border-blue-200">
                <h2 className="text-xl font-bold mb-2">Question 1</h2>
                <p>What is the capital of France?</p>
            </div>
            </div>
        </div>
    )
}

export default SlidePreview;