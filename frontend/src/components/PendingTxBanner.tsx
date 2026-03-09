import { Loader2 } from 'lucide-react';

export function PendingTxBanner() {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 flex items-center gap-2">
      <Loader2 className="h-4 w-4 text-primary animate-spin" />
      <span className="text-xs font-medium text-primary">Transaction pending…</span>
    </div>
  );
}
