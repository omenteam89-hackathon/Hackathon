import { Outlet } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import TopBar from './TopBar';
import SideNav from './SideNav';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useDataStore } from '../../store/useDataStore';
import { loadAppData } from '../../data/loaders';
import { repository } from '../../data/repository';

export default function ConsoleShell() {
  const depotId = useSessionStore(s => s.depotId);
  const setDepotId = useSessionStore(s => s.setDepotId);
  const setRole = useSessionStore(s => s.setRole);
  const isLoaded = useComplaintStore(state => state.isLoaded);
  const complaintsMap = useComplaintStore(state => state.complaints);
  const setRouteMap = useDataStore(state => state.setRouteMap);
  const setDepots = useDataStore(state => state.setDepots);
  
  const openCount = useMemo(() => {
    return Object.values(complaintsMap).filter(c => 
      c.depotId === depotId && !['RESOLVED', 'REJECTED'].includes(c.status)
    ).length;
  }, [complaintsMap, depotId]);

  useEffect(() => {
    // Auto-load data and set mock session for demo
    if (!isLoaded) {
      loadAppData().then((res) => {
        setRouteMap(res.data.routeMap);
        setDepots(res.data.depots);
        const currentComplaints = repository.list();
        if (currentComplaints.length === 0) {
          repository.seed(res.data.complaints);
        } else {
          // Just mark it loaded if it wasn't
          useComplaintStore.setState({ isLoaded: true });
        }
      });
    }
    if (!depotId) {
      setDepotId('TVM-CTY');
      setRole('DEPOT');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans text-ink">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile bottom tabs */}
      <div className="md:hidden border-t border-border bg-white h-14 flex items-center justify-around sticky bottom-0">
        <div className="text-xs text-primary flex flex-col items-center">
          <span className="text-lg">📊</span>
          Overview
        </div>
        <div className="text-xs text-muted flex flex-col items-center relative">
          <span className="text-lg">📥</span>
          Inbox
          {openCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-brand rounded-full"></span>
          )}
        </div>
      </div>
    </div>
  );
}
