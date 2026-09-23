import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useDataStore } from '../../store/useDataStore';
import StatusBadge from '../../shared/StatusBadge';
import EmptyState from '../../shared/EmptyState';
import { Inbox } from 'lucide-react';
import { format } from 'date-fns';

export default function InboxPage() {
  const depotId = useSessionStore(s => s.depotId);
  const complaintsMap = useComplaintStore(state => state.complaints);
  const routeMap = useDataStore(state => state.routeMap);
  
  const inbox = useMemo(() => {
    return Object.values(complaintsMap)
      .filter(c => c.depotId === depotId && !['RESOLVED', 'REJECTED'].includes(c.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [complaintsMap, depotId]);

  if (inbox.length === 0) {
    return <EmptyState icon={Inbox} title="No complaints yet" hint="There are no open complaints in your inbox." />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Inbox</h1>
      <div className="bg-white border border-border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-muted/5 border-b border-border">
              <th className="px-3 py-2 font-semibold">ID</th>
              <th className="px-3 py-2 font-semibold">Created</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Category</th>
              <th className="px-3 py-2 font-semibold">Route</th>
              <th className="px-3 py-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {inbox.map(c => {
              const routeInfo = routeMap.find(r => r.routeNo === c.routeNo);
              const displayRoute = routeInfo ? routeInfo.routeName || c.routeNo : c.routeNo;
              return (
                <tr key={c.id} className="border-b border-border hover:bg-muted/5">
                  <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{format(new Date(c.createdAt), 'dd MMM, p')}</td>
                  <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
                  <td className="px-3 py-2">{c.category}</td>
                  <td className="px-3 py-2">{displayRoute}</td>
                  <td className="px-3 py-2">
                    <Link to={`/console/depot/case/${c.id}`} className="text-primary hover:underline font-medium">View</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
