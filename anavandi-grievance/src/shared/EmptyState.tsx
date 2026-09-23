import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, hint, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted" />
      </div>
      <h3 className="font-semibold text-lg text-ink mb-2">{title}</h3>
      <p className="text-muted text-sm max-w-sm mb-6">{hint}</p>
      {action}
    </div>
  );
}
