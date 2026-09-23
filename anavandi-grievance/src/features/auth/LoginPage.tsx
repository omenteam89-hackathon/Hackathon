import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Loader2 } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useComplaintStore } from '../../store/useComplaintStore';
import { loadAppData } from '../../data/loaders';
import { repository } from '../../data/repository';

export default function LoginPage() {
  const navigate = useNavigate();
  const depots = useDataStore(s => s.depots);
  const setDepotId = useSessionStore(s => s.setDepotId);
  const setRole = useSessionStore(s => s.setRole);
  const isLoaded = useComplaintStore(s => s.isLoaded);
  
  const [selectedDepot, setSelectedDepot] = useState('TVM-CTY');

  useEffect(() => {
    if (!isLoaded) {
      loadAppData().then((res) => {
        useDataStore.getState().setRouteMap(res.data.routeMap);
        useDataStore.getState().setDepots(res.data.depots);
        useDataStore.getState().setCategories(res.data.categories);
        const currentComplaints = repository.list();
        if (currentComplaints.length === 0) {
          repository.seed(res.data.complaints);
          console.log(`Loaded ${res.data.complaints.length} complaints`);
        } else {
          useComplaintStore.setState({ isLoaded: true });
        }
      });
    }
  }, [isLoaded]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepot) return;
    setDepotId(selectedDepot);
    setRole('DEPOT');
    navigate('/console/depot');
  };
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <header className="bg-brand text-white shadow-sm sticky top-0 z-10 border-b border-brand">
        <div className="max-w-screen-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Bus className="w-5 h-5" />
            KSRTC Staff Console
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-sm border border-border">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription className="text-muted">Enter your credentials to access the console</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoaded && depots.length > 0 ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-ink">Select Depot</label>
                  <select 
                    className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                    value={selectedDepot}
                    onChange={(e) => setSelectedDepot(e.target.value)}
                    required
                  >
                    {depots.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-2 bg-brand text-white font-medium rounded hover:opacity-90 transition-opacity"
                >
                  Access Console
                </button>
              </form>
            ) : (
              <div className="py-8 flex justify-center text-muted">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
