import Toolbar from '@/components/Toolbar';
import TemplatePreview from '@/components/TemplatePreview';
import SlideEditor from '@/components/SlideEditor';
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="flex w-screen h-screen text-gray-500">
        <div className="flex flex-col flex-grow">
          {/* Quiz creator traka */}
          <div className="h-[4vh] flex items-center flex-shrink-0 px-8 border-gray-300">
            <h1 className="text-lg font-medium">Quiz creator</h1>
          </div>
          <div className="grid grid-cols-20 gap-2">
            {/* Alatna traka */}
            <Toolbar/>
            {/* Template preview */}
            <TemplatePreview/>
            {/* Slide editor area */}
            <SlideEditor/>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
