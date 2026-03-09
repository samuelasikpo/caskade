import { AlertTriangle } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';

export function NetworkBanner() {
  const { network, connected } = useWalletStore();

  if (!connected || network === 'testnet') return null;

  return (
    <div className="w-full bg-primary/15 border-b border-primary/30 px-4 py-2 flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
      <span className="text-xs font-medium text-primary">
        Please switch to Stacks Testnet to use Caskade
      </span>
    </div>
  );
}
