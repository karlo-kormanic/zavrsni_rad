

export default function Home() {
  return (
    <>
      {/* component */}
      <div className="flex w-screen h-screen text-gray-500">
        {/* Component Start */}
        <div className="flex flex-col flex-grow">
          <div className="h-[4vh] flex items-center flex-shrink-0 px-8 border-gray-300">
            <h1 className="text-lg font-medium">Quiz creator</h1>
          </div>
          <div className="grid grid-cols-20 gap-2">
              <div className="h-[4vh] col-span-17 bg-white border border-gray-300" />
              <div className="h-[calc(80vh_+_8px)] row-span-2 col-span-3 bg-white border border-gray-300" />
              <div className="col-span-3 h-[76vh] bg-white rounded-lg shadow-md overflow-y-auto">
                <div className="flex flex-col items-center gap-4 p-4 min-h-screen">
                  <div className="border border-blue-200">
                    <h2 className="text-xl font-bold mb-2">Question 1</h2>
                    <p>What is the capital of France?</p>
                  </div>
                </div>
              </div>
            <div className="grid grid-rows-2 col-span-14 gap-2">
              <div className="h-[61vh] row-span-1 bg-white border border-gray-300" />
              <div className="h-[calc(15vh_-_8px)] row-span-1 bg-white border border-gray-300" />
            </div>
            {/*<div className="h-24 col-span-3 bg-white border border-gray-300" />
            <div className="h-24 col-span-1 bg-white border border-gray-300" />*/}
          </div>
        </div>
        {/* Component End  */}
      </div>
      
    </>
    
  );
}
