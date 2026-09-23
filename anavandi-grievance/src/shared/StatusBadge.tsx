import { cn } from '../lib/utils';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle, FileText } from 'lucide-react';

export type Status = 'SUBMITTED' | 'UNROUTED' | 'ASSIGNED_TO_DEPOT' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'AWAITING_INFO' | 'ESCALATED' | 'RESOLVED' | 'REJECTED' | 'REOPENED';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    SUBMITTED: { label: 'Submitted', color: 'bg-muted/20 text-muted', icon: FileText },
    UNROUTED: { label: 'Unrouted', color: 'bg-muted/20 text-muted', icon: AlertCircle },
    ASSIGNED_TO_DEPOT: { label: 'Assigned', color: 'bg-blue-100 text-blue-700', icon: Clock },
    ACKNOWLEDGED: { label: 'Acknowledged', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
    AWAITING_INFO: { label: 'Awaiting Info', color: 'bg-amber-100 text-amber-700', icon: Clock },
    ESCALATED: { label: 'Escalated', color: 'bg-red-100 text-brand', icon: AlertCircle },
    RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', color: 'bg-muted/20 text-muted', icon: XCircle },
    REOPENED: { label: 'Reopened', color: 'bg-amber-100 text-amber-700', icon: RefreshCw },
  };

  const { label, color, icon: Icon } = config[status] || config.SUBMITTED;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1 font-medium border-0", color, className)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}
