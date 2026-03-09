import { useState } from 'react';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/store/walletStore';
import { useMintSbtc } from '@/hooks/useVaultWrite';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'caskade-faucet-dismissed';

export function FaucetPanel() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [amount, setAmount] = useState('100');
  const { network, address } = useWalletStore();
  const mintSbtc = useMintSbtc();

  if (dismissed || network !== 'testnet') return null;

  const handleMint = () => {
    const mintAmount = parseFloat(amount) || 0;
    if (mintAmount <= 0 || !address) return;
    mintSbtc.mutate(
      { amount: mintAmount, recipient: address },
      {
        onSuccess: () => {
          toast({ title: 'Mint submitted', description: `${mintAmount} mock sBTC mint transaction sent.` });
        },
        onError: (err) => {
          toast({ title: 'Mint failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="rounded-lg border border-border bg-card border-l-4 border-l-warning p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-foreground">Testnet Mode</h3>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Dismiss faucet panel">
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Mint mock sBTC tokens to test vault deposits and withdrawals.
      </p>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-[200px]">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Amount"
          />
        </div>
        <Button size="sm" onClick={handleMint} disabled={mintSbtc.isPending || !address || (parseFloat(amount) || 0) <= 0}>
          {mintSbtc.isPending ? 'Minting…' : 'Mint Test sBTC'}
        </Button>
      </div>
      <a
        href="https://explorer.hiro.so/sandbox/faucet?chain=testnet"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        Request from Hiro Faucet <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
      </a>
    </div>
  );
}
