import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  tone?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export default function KpiCard({ label, value, delta, tone = 'neutral', className }: KpiCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted font-normal">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-ink">{value}</span>
          {delta && (
            <span className={cn(
              "text-xs font-medium",
              tone === 'positive' && "text-green-600",
              tone === 'negative' && "text-brand",
              tone === 'neutral' && "text-muted"
            )}>
              {delta}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
