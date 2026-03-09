import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Vault as VaultIcon } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { FaucetPanel } from '@/components/FaucetPanel';
import { SkeletonStatCard, SkeletonTable } from '@/components/SkeletonCard';
import { VAULT_REGISTRY } from '@/config/vaults';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWalletStore } from '@/store/walletStore';
import { useBalances } from '@/hooks/useBalances';
import { useVaultData } from '@/hooks/useVaultRead';
import { useTransactions } from '@/hooks/useTransactions';
import { useBtcPrice } from '@/hooks/useBtcPrice';
import { formatUsd, truncateAddress } from '@/lib/format';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { address } = useWalletStore();
  const { data: btcPrice = 67432 } = useBtcPrice();
  const { data: balances, isLoading: balancesLoading } = useBalances(address);
  const { data: txData, isLoading: txLoading } = useTransactions(address);
  const { data: sbtcVaultData } = useVaultData('sbtc-vault');
  const { data: autoVaultData } = useVaultData('auto-compound-vault');

  const loading = balancesLoading;

  useEffect(() => {
    document.title = 'Dashboard — Caskade';
  }, []);

  const shareBalances = balances?.shareBalances || {};
  const vaultDataMap: Record<string, { sharePrice: number; apy: number }> = {
    'sbtc-vault': { sharePrice: sbtcVaultData?.sharePrice ?? 1, apy: sbtcVaultData?.apy ?? 0 },
    'auto-compound-vault': { sharePrice: autoVaultData?.sharePrice ?? 1, apy: autoVaultData?.apy ?? 0 },
  };

  // Build positions from on-chain share balances
  const positions = VAULT_REGISTRY
    .map((v) => {
      const shares = shareBalances[v.id] ?? 0;
      const sp = vaultDataMap[v.id]?.sharePrice ?? 1;
      const apy = vaultDataMap[v.id]?.apy ?? 0;
      return { vaultId: v.id, vaultName: v.name, sharesHeld: shares, sharePrice: sp, apy, assetValue: shares * sp };
    })
    .filter((p) => p.sharesHeld > 0);

  const totalDeposited = positions.reduce((s, p) => s + p.assetValue, 0);
  const totalShares = positions.reduce((s, p) => s + p.sharesHeld, 0);
  const weightedApy = positions.reduce((s, p) => s + p.apy * p.assetValue, 0) / (totalDeposited || 1);

  const recentTx = (txData || []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Personalized header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          {address ? (
            <>Connected as <span className="font-mono text-foreground">{truncateAddress(address)}</span></>
          ) : (
            'Your sBTC vault overview'
          )}
        </p>
      </div>

      <div className="h-px bg-border" />

      <FaucetPanel />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
          <StatCard
            label="Total Deposited"
            value={`${totalDeposited.toFixed(4)} sBTC`}
            subtext={`≈ ${formatUsd(totalDeposited * btcPrice)}`}
          />
          <StatCard label="Your Shares" value={totalShares.toFixed(4)} />
          <StatCard label="Current APY" value={`${weightedApy.toFixed(2)}%`} trend="up" />
          <StatCard
            label="sBTC Balance"
            value={`${(balances?.sbtcBalance ?? 0).toFixed(4)} sBTC`}
            subtext={`≈ ${formatUsd((balances?.sbtcBalance ?? 0) * btcPrice)}`}
          />
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={2} />
      ) : (
        <div className="rounded-lg border border-border bg-card animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Active Positions</h2>
            <Link to="/vaults" className="text-xs text-primary hover:underline flex items-center gap-1">
              Explore Vaults <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </div>
          {positions.length === 0 ? (
            <EmptyState icon={VaultIcon} message="No active positions. Explore vaults to get started." actionLabel="Browse Vaults" actionHref="/vaults" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] uppercase tracking-wider">Vault</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-right">Shares</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-right hidden sm:table-cell">Share Price</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-right">Assets</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-right hidden sm:table-cell">APY</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos) => (
                  <TableRow key={pos.vaultId}>
                    <TableCell className="font-medium text-sm">{pos.vaultName}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{pos.sharesHeld.toFixed(4)}</TableCell>
                    <TableCell className="text-right font-mono text-sm hidden sm:table-cell">{pos.sharePrice.toFixed(4)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{pos.assetValue.toFixed(4)} <span className="text-muted-foreground">sBTC</span></TableCell>
                    <TableCell className="text-right font-mono text-sm text-success hidden sm:table-cell">{pos.apy.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/vaults/${pos.vaultId}`} className="text-xs text-primary hover:underline">Manage</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {txLoading ? (
        <SkeletonTable rows={4} />
      ) : (
        <div className="rounded-lg border border-border bg-card animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <Link to="/transactions" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No transactions yet</div>
          ) : (
            <div className="divide-y divide-border">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.type === 'deposit' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {tx.type === 'deposit' ? (
                      <ArrowDownLeft className="h-4 w-4 text-success" strokeWidth={1.5} />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.vaultName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-foreground">{tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(4)} <span className="text-muted-foreground">sBTC</span></p>
                    <p className="text-[11px] text-muted-foreground">{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
