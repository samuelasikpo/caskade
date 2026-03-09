import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { extractNumber } from '@/lib/format';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ label, value, subtext, trend, className }: StatCardProps) {
  const numericValue = extractNumber(value);
  const match = value.match(/^([+\-]?)([\d,]+\.?\d*)\s*(.*)$/);
  const prefix = match?.[1] || '';
  const suffix = match?.[3] ? ` ${match[3]}` : '';
  const decimals = match?.[2]?.includes('.') ? (match[2].split('.')[1]?.length || 0) : 0;

  return (
    <div className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className={cn(
        'mt-1 flex items-center gap-1.5',
      )}>
        <p className={cn(
          'text-2xl font-semibold font-mono tracking-tight',
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-destructive',
          !trend && 'text-card-foreground'
        )}>
          {numericValue !== null ? (
            <AnimatedNumber value={numericValue} decimals={decimals} prefix={prefix} suffix={suffix} />
          ) : (
            value
          )}
        </p>
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-success shrink-0" strokeWidth={1.5} />}
        {trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive shrink-0" strokeWidth={1.5} />}
      </div>
      {subtext && (
        <p className={cn(
          'mt-0.5 text-xs font-mono',
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-destructive',
          !trend && 'text-muted-foreground'
        )}>
          {subtext}
        </p>
      )}
    </div>
  );
}
