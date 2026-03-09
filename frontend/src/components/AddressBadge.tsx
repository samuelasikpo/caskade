import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressBadgeProps {
  address: string;
  truncate?: boolean;
  explorerLink?: boolean;
  className?: string;
}

export function AddressBadge({ address, truncate = true, explorerLink = false, className }: AddressBadgeProps) {
  const [copied, setCopied] = useState(false);

  const displayed = truncate
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground', className)}>
      <span>{displayed}</span>
      <button
        onClick={handleCopy}
        className="hover:text-foreground transition-colors"
        aria-label="Copy address"
      >
        {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      </button>
      {explorerLink && (
        <a
          href={`https://explorer.hiro.so/address/${address}?chain=testnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
          aria-label="View on explorer"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </span>
  );
}
