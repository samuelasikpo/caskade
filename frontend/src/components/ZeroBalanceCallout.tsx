import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

export function ZeroBalanceCallout() {
  return (
    <div className="rounded-md border border-border bg-secondary p-3 flex items-start gap-2">
      <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
      <div>
        <p className="text-xs text-muted-foreground">
          You have no sBTC to deposit.{' '}
          <Link to="/" className="text-primary hover:underline">
            Mint test tokens
          </Link>{' '}
          from the Dashboard to get started.
        </p>
      </div>
    </div>
  );
}
