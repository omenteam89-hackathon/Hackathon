import { cn } from '../lib/utils';
import { Clock } from 'lucide-react';
import { useClockStore } from '../store/useClockStore';

interface SlaTimerProps {
  deadline: string;
  pausedAt?: string;
  className?: string;
}

export default function SlaTimer({ deadline, pausedAt, className }: SlaTimerProps) {
  const simNow = useClockStore(s => s.simNow);
  
  const now = pausedAt ? new Date(pausedAt) : new Date(simNow);
  const target = new Date(deadline);
  const diffMs = target.getTime() - now.getTime();
  
  let state = 'ok' as 'ok' | 'warn' | 'breach';
  if (diffMs < 0) {
    state = 'breach';
  } else if (diffMs < 2 * 60 * 60 * 1000) { // warn if < 2h
    state = 'warn';
  }
  
  const absDiff = Math.abs(diffMs);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  const timeText = diffMs < 0 
    ? `${hours}h ${mins}m overdue`
    : `${hours}h ${mins}m left`;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md",
      state === 'ok' && "bg-green-100 text-sla-ok",
      state === 'warn' && "bg-orange-100 text-sla-warn",
      state === 'breach' && "bg-red-100 text-brand",
      className
    )}>
      <Clock className="w-3.5 h-3.5" />
      {pausedAt ? `Paused: ${timeText}` : timeText}
    </div>
  );
}
