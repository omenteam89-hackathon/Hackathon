import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useSessionStore } from '../../store/useSessionStore';
import CategoryIcon from '../../shared/CategoryIcon';
import EscalationLevelChip from '../../shared/EscalationLevelChip';
import { useFormatters } from '../../lib/formatters';
import { formatAppDate } from '../../lib/utils';

export default function EscalatedPage() {
  const depotId = useSessionStore(s => s.depotId);
  const complaintsMap = useComplaintStore(state => state.complaints);
  const { categoryLabel, routeName } = useFormatters();
  
  const escalated = useMemo(() => {
    return Object.values(complaintsMap)
      .filter(c => c.depotId === depotId && c.escalationLevel >= 1)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [complaintsMap, depotId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Escalated Cases</h1>
          <p className="text-sm text-muted">Complaints escalated from this depot</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Escalated At</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {escalated.map(c => {
              const displayRoute = routeName(c.routeNo);
              const displayCategory = categoryLabel(c.category);
              
              const escalatedEvent = c.timeline.slice().reverse().find(t => t.type === 'ESCALATED');
              const escalatedAt = escalatedEvent ? formatAppDate(escalatedEvent.at) : 'Unknown';
              const reason = escalatedEvent ? escalatedEvent.message : 'Deadline breached';

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
                  <td className="px-4 py-3 text-muted">
                    {escalatedAt}
                  </td>
                  <td className="px-4 py-3">
                    <EscalationLevelChip level={c.escalationLevel} />
                  </td>
                  <td className="px-4 py-3 text-muted max-w-[200px] truncate" title={reason}>
                    {reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {escalated.length === 0 && (
          <div className="p-12 text-center text-muted">
            No escalated cases.
          </div>
        )}
      </div>
    </div>
  );
}
