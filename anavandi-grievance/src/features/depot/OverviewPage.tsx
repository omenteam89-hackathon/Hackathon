import { Link } from 'react-router-dom';

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Depot Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
          <p className="text-sm text-muted">Open Cases</p>
          <p className="text-3xl font-semibold text-ink mt-2">12</p>
        </div>
        <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
          <p className="text-sm text-muted">Escalated</p>
          <p className="text-3xl font-semibold text-brand mt-2">3</p>
        </div>
        <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
          <p className="text-sm text-muted">SLA Compliance</p>
          <p className="text-3xl font-semibold text-sla-ok mt-2">94%</p>
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
