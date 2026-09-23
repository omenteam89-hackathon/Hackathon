import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useSessionStore } from '../../store/useSessionStore';
import StatusBadge from '../../shared/StatusBadge';
import CategoryIcon from '../../shared/CategoryIcon';
import EscalationLevelChip from '../../shared/EscalationLevelChip';
import { useFormatters } from '../../lib/formatters';

export default function InboxPage() {
  const depotId = useSessionStore(s => s.depotId);
  const complaintsMap = useComplaintStore(state => state.complaints);
  const { categoryLabel, routeName, formatDate } = useFormatters();
  
  const inbox = useMemo(() => {
    return Object.values(complaintsMap)
      .filter(c => c.depotId === depotId && !['RESOLVED', 'REJECTED'].includes(c.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [complaintsMap, depotId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Action Inbox</h1>
          <p className="text-sm text-muted">Complaints requiring depot action</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inbox.map(c => {
              const displayRoute = routeName(c.routeNo);
              const displayCategory = categoryLabel(c.category);
              
              return (
                <tr key={c.id} className="hover:bg-muted/5 transition-colors group">
                  <td className="px-4 py-3">
                    <Link to={`/console/depot/case/${c.id}`} className="font-mono text-primary font-medium group-hover:underline">
                      {c.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <CategoryIcon category={c.category} className="w-6 h-6 p-1 rounded" />
                    <span className="capitalize">{displayCategory}</span>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {displayRoute}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      <EscalationLevelChip level={c.escalationLevel} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {inbox.length === 0 && (
          <div className="p-12 text-center text-muted">
            No active cases in your inbox.
          </div>
        )}
      </div>
    </div>
  );
}
