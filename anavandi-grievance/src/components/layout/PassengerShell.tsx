import { Outlet, Link } from 'react-router-dom';
import { Bus } from 'lucide-react';

export default function PassengerShell() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <header className="bg-brand text-white shadow-sm sticky top-0 z-10 border-b border-brand">
        <div className="max-w-screen-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Bus className="w-5 h-5" />
            KSRTC Grievance
          </Link>
          <div className="flex items-center gap-2">
            {/* Language Switcher Placeholder */}
            <span className="text-sm bg-white/20 px-2 py-1 rounded cursor-pointer">English ▼</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-screen-md w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      <footer className="mt-8 py-6 border-t border-border bg-white text-sm text-muted">
        <div className="flex flex-col gap-4 max-w-screen-md mx-auto px-4">
          <p>Your identity is never shown publicly.</p>
          <div className="flex gap-4">
            <Link to="/dashboard" className="text-primary hover:underline">Public dashboard</Link>
            <span className="text-border">•</span>
            <Link to="/console/login" className="text-primary hover:underline">Staff console</Link>
            <span className="text-border">•</span>
            <Link to="/demo" className="text-primary hover:underline bg-muted/10 px-2 rounded">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
