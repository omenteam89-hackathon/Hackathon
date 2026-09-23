import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useSessionStore } from '../../store/useSessionStore';

export default function OverviewPage() {
  const depotId = useSessionStore(s => s.depotId);
  const complaintsMap = useComplaintStore(state => state.complaints);

  const stats = useMemo(() => {
    const cases = Object.values(complaintsMap).filter(c => c.depotId === depotId);
    
    let openCount = 0;
    let escalatedCount = 0;
    let resolvedCount = 0;
    let slaMetCount = 0;

    cases.forEach(c => {
      const isResolvedOrRejected = ['RESOLVED', 'REJECTED'].includes(c.status);
      
      if (!isResolvedOrRejected) {
        openCount++;
        if (c.escalationLevel >= 1) {
          escalatedCount++;
        }
      }
      
      if (c.status === 'RESOLVED') {
        resolvedCount++;
        const resolvedEvent = c.timeline.slice().reverse().find(t => t.type === 'RESOLVED');
        if (resolvedEvent) {
          const resolvedAt = new Date(resolvedEvent.at).getTime();
          const deadline = new Date(c.resolveDeadline).getTime();
          if (resolvedAt <= deadline) {
            slaMetCount++;
          }
        }
      }
    });

    const slaCompliance = resolvedCount > 0 ? Math.round((slaMetCount / resolvedCount) * 100) : 100;

    return { openCount, escalatedCount, slaCompliance };
  }, [complaintsMap, depotId]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Depot Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
          <p className="text-sm text-muted">Open Cases</p>
          <p className="text-3xl font-semibold text-ink mt-2">{stats.openCount}</p>
        </div>
        <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
          <p className="text-sm text-muted">Escalated</p>
          <p className="text-3xl font-semibold text-brand mt-2">{stats.escalatedCount}</p>
        </div>
        <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
          <p className="text-sm text-muted">SLA Compliance</p>
          <p className="text-3xl font-semibold text-sla-ok mt-2">{stats.slaCompliance}%</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/console/depot/inbox" className="px-4 py-2 bg-primary text-white font-medium rounded hover:opacity-90">
          View Inbox
        </Link>
      </div>
    </div>
  );
}
