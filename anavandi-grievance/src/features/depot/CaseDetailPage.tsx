import { useParams } from 'react-router-dom';
import { useComplaintStore } from '../../store/useComplaintStore';
import StatusBadge from '../../shared/StatusBadge';
import { format } from 'date-fns';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const complaintsMap = useComplaintStore(state => state.complaints);
  const complaint = id ? complaintsMap[id] : null;

  if (!complaint) return <div className="p-4 text-muted">Case not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold font-mono text-ink">{complaint.id}</h1>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-border shadow-sm space-y-2">
            <h2 className="font-semibold text-ink">Details</h2>
            <div className="text-sm">
              <span className="text-muted w-24 inline-block">Created:</span>
              <span>{format(new Date(complaint.createdAt), 'dd MMM, p')}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted w-24 inline-block">Category:</span>
              <span>{complaint.category}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted w-24 inline-block">Route:</span>
              <span>{complaint.routeNo}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted w-24 inline-block">Bus No:</span>
              <span>{complaint.busNo}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-border shadow-sm">
            <h2 className="font-semibold text-ink mb-2">Description</h2>
            <p className="text-sm text-ink">{complaint.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
