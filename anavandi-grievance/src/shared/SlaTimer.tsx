import { cn } from '../lib/utils';
import { Clock } from 'lucide-react';

interface SlaTimerProps {
  deadline: string;
  pausedAt?: string;
  className?: string;
}

export default function SlaTimer({ deadline, pausedAt, className }: SlaTimerProps) {
  // Static for now, Phase 3 will make it live
  let state = 'warn' as 'ok' | 'warn' | 'breach';
  console.log(deadline, pausedAt); // 'ok' | 'warn' | 'breach'
  const timeText = '2h 15m left';

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md",
      state === 'ok' && "bg-green-100 text-sla-ok",
      state === 'warn' && "bg-orange-100 text-sla-warn",
      state === 'breach' && "bg-red-100 text-brand",
      className
    )}>
      <Clock className="w-3.5 h-3.5" />
      {timeText}
    </div>
  );
}
