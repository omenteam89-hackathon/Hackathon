import { useEffect, useState } from 'react';
import AppRouter from './app/router';
import { loadAppData } from './data/loaders';
import { repository } from './data/repository';
import { useComplaintStore } from './store/useComplaintStore';
import { useDataStore } from './store/useDataStore';
import { useClockStore } from './store/useClockStore';
import { Loader2 } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const seeded = useComplaintStore(s => s.seeded);
  
  const setRouteMap = useDataStore(state => state.setRouteMap);
  const setDepots = useDataStore(state => state.setDepots);
  const setCategories = useDataStore(state => state.setCategories);
  const setRegions = useDataStore(state => state.setRegions);
  
  const tick = useClockStore(s => s.tick);

  useEffect(() => {
    loadAppData().then((res) => {
      setRouteMap(res.data.routeMap);
      setDepots(res.data.depots);
      setCategories(res.data.categories);
      setRegions(res.data.regions);
      
      if (!seeded) {
         repository.seed(res.data.complaints);
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
       const interval = setInterval(() => {
         tick();
       }, 1000);
       return () => clearInterval(interval);
    }
  }, [loading, tick]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <AppRouter />
  );
}

export default App;
