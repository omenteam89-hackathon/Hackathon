import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

interface EscalationLevelChipProps {
  level: number;
  className?: string;
}

export default function EscalationLevelChip({ level, className }: EscalationLevelChipProps) {
  const map: Record<number, { label: string, color: string }> = {
    0: { label: 'L0 Depot', color: 'bg-muted/10 text-muted' },
    1: { label: 'L1 Regional', color: 'bg-amber-100 text-amber-800' },
    2: { label: 'L2 Head Office', color: 'bg-red-100 text-brand' },
  };
  
  const { label, color } = map[level] || map[0];

  return (
    <Badge variant="outline" className={cn("border-0 text-[10px]", color, className)}>
      {label}
    </Badge>
  );
}
