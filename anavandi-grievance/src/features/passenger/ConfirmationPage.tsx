import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Check, Copy, Loader2, ArrowRight } from 'lucide-react';
import { loadAppData } from '../../data/loaders';
import { useComplaintStore } from '../../store/useComplaintStore';
import { formatAppDate } from '../../lib/utils';
import type { Depot } from '../../domain/types';

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const complaint = useComplaintStore(s => id ? s.complaints[id] : null);
  const [depot, setDepot] = useState<Depot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!complaint) {
      setLoading(false);
      return;
    }
    
    if (complaint.depotId) {
        loadAppData().then(res => {
          const d = res.data.depots.find(d => d.id === complaint.depotId);
          if (d) setDepot(d);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
  }, [complaint?.depotId]);

  const copyId = () => {
    if (id) {
      navigator.clipboard.writeText(id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-border text-center">
        <p className="text-muted">Complaint not found.</p>
        <Link to="/" className="text-primary mt-4 inline-block hover:underline">Return home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-border text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8" />
      </div>
      
      <h1 className="text-2xl font-semibold text-ink mb-2">Report Submitted</h1>
      <p className="text-sm text-muted mb-8">Your complaint has been successfully recorded.</p>
      
      <div className="bg-surface border border-border rounded-lg p-6 mb-8">
        <p className="text-sm text-muted mb-2">Reference Number</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-mono font-bold tracking-tight text-ink">{id}</span>
          <button 
            onClick={copyId}
            className="p-2 text-muted hover:text-ink bg-white border border-border rounded shadow-sm transition-colors"
            title="Copy reference number"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-left space-y-4 mb-8">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          {depot ? (
            <>
              <p className="font-medium text-blue-900 mb-1">Assigned to: {depot.name} depot</p>
              <p className="text-sm text-blue-800">
                Depot must respond by: <span className="font-semibold">{formatAppDate(complaint.ackDeadline)}</span>
              </p>
            </>
          ) : (
            <p className="font-medium text-blue-900">We're finding the right depot for your complaint.</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Link 
          to={`/track?id=${id}`}
          className="w-full py-2.5 bg-primary text-white font-medium rounded hover:opacity-90 flex justify-center items-center gap-2"
        >
          Track Status
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link 
          to="/"
          className="w-full py-2.5 bg-surface text-ink font-medium rounded border border-border hover:bg-muted/5 flex justify-center items-center"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
