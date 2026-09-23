import { Bus } from 'lucide-react';

export default function DemoPanel() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <header className="bg-brand text-white shadow-sm sticky top-0 z-10 border-b border-brand">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Bus className="w-5 h-5" />
            Demo Control Panel
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-screen-xl mx-auto w-full p-4 md:p-8 space-y-8">
        <div>DemoPanel placeholder</div>
      </main>
    </div>
  );
}
