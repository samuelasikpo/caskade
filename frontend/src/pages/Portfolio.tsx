import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { USER_POSITIONS, VAULTS } from '@/data/mockData';
import { StatCard } from '@/components/StatCard';
import { SkeletonStatCard, SkeletonTable } from '@/components/SkeletonCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBtcPrice } from '@/hooks/useBtcPrice';
import { formatUsd } from '@/lib/format';

const VAULT_COLORS = ['hsl(24.6, 95%, 53.1%)', 'hsl(142.1, 76.2%, 36.3%)'];

export default function Portfolio() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Portfolio — Caskade';
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const positions = USER_POSITIONS.map((pos) => {
    const vault = VAULTS.find(v => v.id === pos.vaultId)!;
    const assetValue = pos.sharesHeld * pos.sharePrice;
    const pnl = assetValue - pos.depositedAmount;
    return { ...pos, vault, assetValue, pnl };
  });

  const totalValue = positions.reduce((s, p) => s + p.assetValue, 0);
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const { data: btcPrice = 67432 } = useBtcPrice();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Your consolidated vault positions</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
          <StatCard label="Total Value" value={`${totalValue.toFixed(4)} sBTC`} subtext={`≈ ${formatUsd(totalValue * btcPrice)}`} />
          <StatCard label="Total P&L" value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(4)} sBTC`} trend={totalPnl >= 0 ? 'up' : 'down'} subtext={`≈ ${formatUsd(Math.abs(totalPnl) * btcPrice)}`} />
          <StatCard label="Positions" value={positions.length.toString()} className="hidden lg:block" />
        </div>
      )}

      {!loading && (
        <div className="rounded-lg border border-border bg-card p-4 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground mb-3">Allocation</h2>
          <div className="flex rounded-full overflow-hidden h-3 bg-secondary">
            {positions.map((pos, i) => {
              const pct = (pos.assetValue / totalValue) * 100;
              return (
                <Tooltip key={pos.vaultId}>
                  <TooltipTrigger asChild>
                    <div
                      style={{ width: `${pct}%`, backgroundColor: VAULT_COLORS[i] }}
                      className="h-full transition-all cursor-default hover:opacity-80"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    <p className="font-medium text-foreground">{pos.vaultName}</p>
                    <p className="font-mono text-muted-foreground">{pos.assetValue.toFixed(4)} sBTC · {pct.toFixed(1)}%</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2">
            {positions.map((pos, i) => (
              <div key={pos.vaultId} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: VAULT_COLORS[i] }} />
                <span className="text-[11px] text-muted-foreground">{pos.vaultName} ({((pos.assetValue / totalValue) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={2} />
      ) : (
        <div className="rounded-lg border border-border bg-card animate-fade-in">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Positions</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-wider">Vault</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">Shares</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right hidden sm:table-cell">Share Price</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">Asset Value</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">P&L</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right hidden sm:table-cell">% Portfolio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos) => {
                const pct = (pos.assetValue / totalValue) * 100;
                return (
                  <TableRow key={pos.vaultId}>
                    <TableCell>
                      <Link to={`/vaults/${pos.vaultId}`} className="text-sm font-medium text-primary hover:underline">{pos.vaultName}</Link>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{pos.sharesHeld.toFixed(4)}</TableCell>
                    <TableCell className="text-right font-mono text-sm hidden sm:table-cell">{pos.sharePrice.toFixed(4)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{pos.assetValue.toFixed(4)} <span className="text-muted-foreground">sBTC</span></TableCell>
                    <TableCell className={`text-right font-mono text-sm ${pos.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm hidden sm:table-cell">{pct.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
