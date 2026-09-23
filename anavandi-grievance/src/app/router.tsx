import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import PassengerShell from '../components/layout/PassengerShell';
import ConsoleShell from '../components/layout/ConsoleShell';

// Passenger Pages
import LandingPage from '../features/passenger/LandingPage';
import ReportPage from '../features/passenger/ReportPage';
import ConfirmationPage from '../features/passenger/ConfirmationPage';
import TrackPage from '../features/passenger/TrackPage';
import TrackDetailPage from '../features/passenger/TrackDetailPage';

// Depot Pages
import LoginPage from '../features/auth/LoginPage';
import OverviewPage from '../features/depot/OverviewPage';
import InboxPage from '../features/depot/InboxPage';
import CaseDetailPage from '../features/depot/CaseDetailPage';
import EscalatedPage from '../features/depot/EscalatedPage';
import AnalyticsPage from '../features/depot/AnalyticsPage';

// Regional Pages
import RegionalInboxPage from '../features/regional/RegionalInboxPage';
import DepotComparePage from '../features/regional/DepotComparePage';
import UnroutedPage from '../features/regional/UnroutedPage';

// Public & Demo
import PublicDashboardPage from '../features/public/PublicDashboardPage';
import DemoPanel from '../features/demo/DemoPanel';

import ComponentsDemoPage from '../features/demo/ComponentsDemoPage';
import DebugPage from '../features/demo/DebugPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PassengerShell />,
    errorElement: (
      <div className="min-h-screen flex items-center justify-center bg-bg font-sans">
        <div className="text-left space-y-4 p-6 bg-white shadow-sm border border-border rounded-lg max-w-sm">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-ink">Something went wrong</h2>
          <p className="text-muted text-sm">An unexpected error occurred in the application.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-brand text-white rounded font-medium hover:opacity-90"
          >
            Reload Page
          </button>
        </div>
      </div>
    ),
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'report', element: <ReportPage /> },
      { path: 'report/success/:id', element: <ConfirmationPage /> },
      { path: 'track', element: <TrackPage /> },
      { path: 'track/:id', element: <TrackDetailPage /> },
      { path: 'dashboard', element: <PublicDashboardPage /> },
      { path: 'demo', element: <DemoPanel /> },
    ],
  },
  {
    path: '/console/login',
    element: <LoginPage />,
  },
  {
    path: '/console',
    element: <ConsoleShell />,
    errorElement: (
      <div className="min-h-screen flex items-center justify-center bg-bg font-sans">
        <div className="text-left space-y-4 p-6 bg-white shadow-sm border border-border rounded-lg max-w-sm">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-ink">Console Error</h2>
          <p className="text-muted text-sm">An unexpected error occurred in the console.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-brand text-white rounded font-medium hover:opacity-90"
          >
            Reload Console
          </button>
        </div>
      </div>
    ),
    children: [
      { path: 'depot', element: <OverviewPage /> },
      { path: 'depot/inbox', element: <InboxPage /> },
      { path: 'depot/case/:id', element: <CaseDetailPage /> },
      { path: 'depot/escalated', element: <EscalatedPage /> },
      { path: 'depot/analytics', element: <AnalyticsPage /> },
      { path: 'regional', element: <RegionalInboxPage /> },
      { path: 'regional/case/:id', element: <CaseDetailPage /> },
      { path: 'regional/depots', element: <DepotComparePage /> },
      { path: 'unrouted', element: <UnroutedPage /> },
    ],
  },
  {
    path: '/__components',
    element: <ComponentsDemoPage />,
  },
  {
    path: '/__debug',
    element: <DebugPage />,
  }
]);

import { useEffect } from 'react';
import { useClockStore } from '../store/useClockStore';

export default function AppRouter() {
  const tick = useClockStore(s => s.tick);
  
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return <RouterProvider router={router} />;
}
