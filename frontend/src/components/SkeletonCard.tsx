import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonStatCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <Skeleton className="h-3 w-20 bg-muted" />
      <Skeleton className="h-7 w-28 bg-muted" />
    </div>
  );
}

export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-4 w-32 bg-muted" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-4 w-16 bg-muted ml-auto" />
            <Skeleton className="h-4 w-20 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <Skeleton className="h-4 w-24 bg-muted" />
      <Skeleton className="h-[240px] w-full bg-muted" />
    </div>
  );
}
