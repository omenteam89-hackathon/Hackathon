import { Brush, AlertTriangle, Users, MapPinOff, TicketX, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export type CategoryId = 'CLEANLINESS' | 'UNSAFE_DRIVING' | 'OVERCROWDING' | 'MISSED_STOP' | 'CONCESSION_DENIAL' | 'OTHER';

interface CategoryIconProps {
  category: CategoryId;
  className?: string;
}

export default function CategoryIcon({ category, className }: CategoryIconProps) {
  const iconMap = {
    CLEANLINESS: { icon: Brush, color: 'text-blue-500', bg: 'bg-blue-100' },
    UNSAFE_DRIVING: { icon: AlertTriangle, color: 'text-brand', bg: 'bg-red-100' },
    OVERCROWDING: { icon: Users, color: 'text-orange-500', bg: 'bg-orange-100' },
    MISSED_STOP: { icon: MapPinOff, color: 'text-purple-500', bg: 'bg-purple-100' },
    CONCESSION_DENIAL: { icon: TicketX, color: 'text-pink-500', bg: 'bg-pink-100' },
    OTHER: { icon: HelpCircle, color: 'text-muted', bg: 'bg-muted/20' },
  };

  const { icon: Icon, color, bg } = iconMap[category] || iconMap.OTHER;

  return (
    <div className={cn("p-2 rounded-lg flex items-center justify-center w-10 h-10", bg, color, className)}>
      <Icon className="w-5 h-5" />
    </div>
  );
}
