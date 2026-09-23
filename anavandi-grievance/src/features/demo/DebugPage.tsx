import { useEffect, useState, useMemo } from 'react';
import { loadAppData } from '../../data/loaders';
import { repository } from '../../data/repository';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useDataStore } from '../../store/useDataStore';

export default function DebugPage() {
  const isLoaded = useComplaintStore(state => state.isLoaded);
  const [loading, setLoading] = useState(false);
  const complaintsMap = useComplaintStore(state => state.complaints);
  const setRouteMap = useDataStore(state => state.setRouteMap);
  const setDepots = useDataStore(state => state.setDepots);
  
  const complaints = useMemo(() => Object.values(complaintsMap), [complaintsMap]);

  useEffect(() => {
    if (!isLoaded && !loading) {
      setLoading(true);
      loadAppData().then((res) => {
        setRouteMap(res.data.routeMap);
        setDepots(res.data.depots);
        const currentComplaints = repository.list();
        if (currentComplaints.length === 0) {
          repository.seed(res.data.complaints);
        } else {
          useComplaintStore.setState({ isLoaded: true });
        }
        setLoading(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !isLoaded) {
    return <div className="p-8">Loading seed data...</div>;
  }

  const byDepot: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  complaints.forEach(c => {
    const dId = c.depotId || 'UNROUTED';
    byDepot[dId] = (byDepot[dId] || 0) + 1;
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  });

  return (
    <div className="p-8 font-sans bg-bg min-h-screen text-ink">
      <h1 className="text-2xl font-bold mb-6 text-brand">Debug Page</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Complaints by Depot</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2">Depot ID</th>
                <th className="py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byDepot).map(([depotId, count]) => (
                <tr key={depotId} className="border-b border-border">
                  <td className="py-2">{depotId}</td>
                  <td className="py-2">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Complaints by Status</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2">Status</th>
                <th className="py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byStatus).map(([status, count]) => (
                <tr key={status} className="border-b border-border">
                  <td className="py-2">{status}</td>
                  <td className="py-2">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
