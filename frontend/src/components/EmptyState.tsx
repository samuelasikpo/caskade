import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border mb-4">
        <Icon className="h-7 w-7 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
      <p className="text-sm text-muted-foreground mb-1">{message}</p>
      <p className="text-xs text-muted-foreground/60 mb-5">Get started by interacting with a vault.</p>
      {actionLabel && actionHref && (
        <Button asChild variant="outline" size="sm">
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
