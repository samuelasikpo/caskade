import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'failed';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
      status === 'confirmed' && 'bg-success/10 text-success',
      status === 'pending' && 'bg-warning/10 text-warning',
      status === 'failed' && 'bg-destructive/10 text-destructive',
    )}>
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        status === 'confirmed' && 'bg-success',
        status === 'pending' && 'bg-warning animate-pulse-glow',
        status === 'failed' && 'bg-destructive',
      )} />
      {status}
    </span>
  );
}
