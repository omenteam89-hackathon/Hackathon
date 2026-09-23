import { Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useFormatters } from '../lib/formatters';

export interface TimelineEvent {
  at: string;
  actor: 'SYSTEM' | 'PASSENGER' | 'DEPOT' | 'REGIONAL' | 'HQ';
  actorName?: string;
  type: string;
  message: string;
  internal?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export default function Timeline({ events, className }: TimelineProps) {
  const { formatDate } = useFormatters();
  
  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-border mt-2" />
            {idx !== events.length - 1 && <div className="w-px h-full bg-border my-1" />}
          </div>
          <div className={cn("flex-1 pb-4", event.internal && "bg-amber-50 p-3 rounded-lg border border-amber-100")}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-ink">{event.actorName || event.actor}</span>
              <span className="text-xs text-muted">{formatDate(event.at)}</span>
              {event.internal && <Lock className="w-3 h-3 text-amber-600" />}
            </div>
            <p className="text-sm text-ink">{event.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
