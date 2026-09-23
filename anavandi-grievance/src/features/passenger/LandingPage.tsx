import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-ink">Grievance Redressal System</h1>
        <p className="text-base text-muted max-w-lg">
          Submit complaints regarding KSRTC services, staff behavior, or bus conditions. You can track the status of your complaint at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white border border-border rounded-lg shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-ink">New Complaint</h2>
          <p className="text-sm text-muted">File a new grievance with details and evidence.</p>
          <Link to="/report" className="inline-block px-4 py-2 bg-primary text-white font-medium rounded hover:opacity-90">
            Report a problem
          </Link>
        </div>

        <div className="p-6 bg-white border border-border rounded-lg shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-ink">Existing Complaint</h2>
          <p className="text-sm text-muted">Check the status of a previously submitted grievance.</p>
          <Link to="/track" className="inline-block px-4 py-2 bg-white border border-border text-ink font-medium rounded hover:bg-muted/5">
            Track complaint
          </Link>
        </div>
      </div>
    </div>
  );
}
