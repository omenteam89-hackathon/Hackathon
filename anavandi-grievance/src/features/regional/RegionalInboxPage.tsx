import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useDataStore } from '../../store/useDataStore';
import CategoryIcon from '../../shared/CategoryIcon';
import EscalationLevelChip from '../../shared/EscalationLevelChip';
import { useFormatters } from '../../lib/formatters';
import { formatAppDate } from '../../lib/utils';
import StatusBadge from '../../shared/StatusBadge';

export default function RegionalInboxPage() {
  const role = useSessionStore(s => s.role);
  const regionId = useSessionStore(s => s.regionId);
  
  const complaintsMap = useComplaintStore(state => state.complaints);
  const depots = useDataStore(state => state.depots);
  const regions = useDataStore(state => state.regions);
  const { categoryLabel, routeName } = useFormatters();
  
  const currentRegion = regions.find(r => r.id === regionId);

  const inbox = useMemo(() => {
    const allEscalated = Object.values(complaintsMap).filter(c => 
      c.escalationLevel >= 1 && !['RESOLVED', 'REJECTED'].includes(c.status)
    );

    let filtered = allEscalated;
    if (role === 'REGIONAL') {
      // Find all depots in this region
      const regionDepotIds = depots.filter(d => d.region === regionId).map(d => d.id);
      filtered = allEscalated.filter(c => c.depotId && regionDepotIds.includes(c.depotId));
    }

    // Sort by most urgent first (oldest resolveDeadline)
    return filtered.sort((a, b) => new Date(a.resolveDeadline).getTime() - new Date(b.resolveDeadline).getTime());
  }, [complaintsMap, role, regionId, depots]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Action Inbox</h1>
          <p className="text-sm text-muted">
            {role === 'HQ' ? 'Escalated complaints across all regions' : `Escalated complaints in ${currentRegion?.name || regionId} region`}
          </p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Depot</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inbox.map(c => {
              const displayRoute = routeName(c.routeNo);
              const displayCategory = categoryLabel(c.category);
              const depotName = depots.find(d => d.id === c.depotId)?.name || c.depotId || 'Unassigned';
              
              return (
                <tr key={c.id} className="hover:bg-muted/5 transition-colors group">
                  <td className="px-4 py-3">
                    <Link to={`/console/regional/case/${c.id}`} className="font-mono text-primary font-medium group-hover:underline">
                      {c.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {depotName}
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
                  <td className="px-4 py-3 text-brand font-medium">
                    {formatAppDate(c.resolveDeadline)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {inbox.length === 0 && (
          <div className="p-12 text-center text-muted">
            No active escalated cases.
          </div>
        )}
      </div>
    </div>
  );
}
