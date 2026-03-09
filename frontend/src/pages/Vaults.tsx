import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VAULT_REGISTRY } from '@/config/vaults';
import { useVaultData } from '@/hooks/useVaultRead';
import { SkeletonStatCard } from '@/components/SkeletonCard';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';

const FILTERS = ['All', 'Base Vaults', 'Auto-Compound'] as const;

function VaultCard({ vault }: { vault: typeof VAULT_REGISTRY[number] }) {
  const { data: vaultData } = useVaultData(vault.id);

  const tvl = vaultData?.tvl ?? 0;
  const sharePrice = vaultData?.sharePrice ?? 0;
  const apy = vaultData?.apy ?? 0;
  const depositCap = vaultData?.depositCap ?? 1;
  const totalDeposited = vaultData?.totalDeposited ?? 0;
  const utilization = depositCap > 0 ? (totalDeposited / depositCap) * 100 : 0;
  const vaultType = vault.type === 'auto-compound' ? 'Auto-Compound' : 'Base';

  return (
    <Link
      to={`/vaults/${vault.id}`}
      className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/40 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 shrink-0">
              <span className="text-xs font-bold text-primary font-mono">₿</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{vault.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-muted-foreground">{vault.shareToken}</span>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-secondary text-muted-foreground border border-border">
                  {vaultType}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="font-mono text-lg font-semibold text-success">{apy.toFixed(2)}%</span>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
              <span className="text-[10px] text-muted-foreground">Live</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">TVL</p>
          <p className="font-mono text-sm text-foreground">{tvl.toFixed(3)} <span className="text-muted-foreground">sBTC</span></p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Share Price</p>
          <p className="font-mono text-sm text-foreground">{sharePrice.toFixed(4)}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Deposit Cap</span>
          <span className="font-mono text-[10px] text-muted-foreground">{utilization.toFixed(1)}%</span>
        </div>
        <Progress value={utilization} className="h-1.5" />
      </div>
    </Link>
  );
}

export default function Vaults() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All');

  useEffect(() => {
    document.title = 'Vaults — Caskade';
  }, []);

  const filtered = VAULT_REGISTRY.filter((v) => {
    if (filter === 'Base Vaults') return v.type === 'base';
    if (filter === 'Auto-Compound') return v.type === 'auto-compound';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Vaults</h1>
        <p className="text-sm text-muted-foreground">Browse and deposit into sBTC yield vaults</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-colors border',
              filter === f
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        {filtered.map((vault) => (
          <VaultCard key={vault.id} vault={vault} />
        ))}
      </div>
    </div>
  );
}
