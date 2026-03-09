import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { generateSharePriceHistory } from '@/data/mockData';
import { useWalletStore } from '@/store/walletStore';
import { useVaultData } from '@/hooks/useVaultRead';
import { useBalances } from '@/hooks/useBalances';
import { useTransactions } from '@/hooks/useTransactions';
import { useDeposit, useWithdraw } from '@/hooks/useVaultWrite';
import { VAULT_REGISTRY } from '@/config/vaults';
import { StatCard } from '@/components/StatCard';
import { AddressBadge } from '@/components/AddressBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { AmountInput } from '@/components/AmountInput';
import { ZeroBalanceCallout } from '@/components/ZeroBalanceCallout';
import { PendingTxBanner } from '@/components/PendingTxBanner';
import { SkeletonStatCard, SkeletonChart, SkeletonTable } from '@/components/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TIME_RANGES = ['7D', '30D', '90D', 'ALL'] as const;

export default function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const vault = VAULT_REGISTRY.find(v => v.id === id);
  const { address } = useWalletStore();
  const { data: vaultData } = useVaultData(id || '');
  const { data: balances } = useBalances(address);
  const { data: txHistory } = useTransactions(address);
  const deposit = useDeposit();
  const withdraw = useWithdraw();

  const sbtcBalance = balances?.sbtcBalance ?? 0;
  const userShares = balances?.shareBalances[id || ''] ?? 0;

  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]>('30D');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (vault) document.title = `${vault.name} — Caskade`;
    const t = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(t);
  }, [vault]);

  if (!vault) return <Navigate to="/vaults" replace />;

  const tvl = vaultData?.tvl ?? 0;
  const sharePrice = vaultData?.sharePrice ?? 0;
  const totalShares = vaultData?.totalShares ?? 0;
  const apy = vaultData?.apy ?? 0;
  const depositCap = vaultData?.depositCap ?? 0;
  const totalDeposited = vaultData?.totalDeposited ?? 0;
  const totalYieldHarvested = vaultData?.totalYieldHarvested ?? 0;
  const vaultTxs = (txHistory || []).filter(t => t.vaultId === vault.id).slice(0, 10);
  const days = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : timeRange === '90D' ? 90 : 365;
  const chartData = generateSharePriceHistory(days);

  const depositNum = parseFloat(depositAmount) || 0;
  const withdrawNum = parseFloat(withdrawAmount) || 0;

  const effectiveSharePrice = sharePrice === 0 ? 1 : sharePrice;
  const sharesToReceive = depositNum / effectiveSharePrice;
  const sbtcToReceive = withdrawNum * effectiveSharePrice;

  const remainingCap = depositCap - totalDeposited;
  const exceedsCap = depositNum > remainingCap;

  const handleAction = (type: 'deposit' | 'withdraw') => {
    setLoading(true);
    if (type === 'deposit') {
      deposit.mutate(
        { vaultId: vault.id, amount: depositNum },
        {
          onSuccess: () => {
            setLoading(false);
            setSuccessMessage('Deposit submitted');
            toast({ title: 'Deposit submitted', description: 'Transaction is being processed on Stacks testnet.' });
            setDepositAmount('');
            setTimeout(() => setSuccessMessage(null), 3000);
          },
          onError: (err) => {
            setLoading(false);
            toast({ title: 'Deposit failed', description: err.message, variant: 'destructive' });
          },
        }
      );
    } else {
      withdraw.mutate(
        { vaultId: vault.id, shares: withdrawNum },
        {
          onSuccess: () => {
            setLoading(false);
            setSuccessMessage('Withdrawal submitted');
            toast({ title: 'Withdrawal submitted', description: 'Transaction is being processed on Stacks testnet.' });
            setWithdrawAmount('');
            setTimeout(() => setSuccessMessage(null), 3000);
          },
          onError: (err) => {
            setLoading(false);
            toast({ title: 'Withdrawal failed', description: err.message, variant: 'destructive' });
          },
        }
      );
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-md border border-border bg-card p-2.5 shadow-lg">
        <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
        <p className="text-xs font-mono text-foreground">
          Price: <span className="text-primary font-semibold">{payload[0].value.toFixed(4)}</span> <span className="text-muted-foreground">sBTC/share</span>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/vaults" className="hover:text-foreground transition-colors">Vaults</Link>
        <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
        <span className="text-foreground font-medium">{vault.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                <span className="text-sm font-bold text-primary font-mono">₿</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground">{vault.name}</h1>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
                    <span className="text-[10px] text-muted-foreground">Live</span>
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{vault.description}</p>
              </div>
            </div>
            <div className="mt-2">
              <AddressBadge address={vault.contractAddress} truncate={false} explorerLink />
            </div>
          </div>

          {/* Key Metrics */}
          {pageLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
              <StatCard label="TVL" value={`${vault.tvl.toFixed(3)} sBTC`} />
              <StatCard label="Share Price" value={effectiveSharePrice.toFixed(4)} />
              <StatCard label="Total Shares" value={vault.totalShares.toFixed(2)} />
              <StatCard label="APY" value={`${vault.apy.toFixed(2)}%`} trend="up" />
            </div>
          )}

          {/* Chart */}
          {pageLoading ? (
            <SkeletonChart />
          ) : (
            <div className="rounded-lg border border-border bg-card p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Share Price</h2>
                <div className="flex gap-1">
                  {TIME_RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={cn(
                        'rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                        timeRange === r
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(24.6, 95%, 53.1%)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(24.6, 95%, 53.1%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(240, 4%, 46%)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'hsl(240, 4%, 46%)' }} axisLine={false} tickLine={false} width={50} tickFormatter={(v: number) => v.toFixed(3)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="price" stroke="hsl(24.6, 95%, 53.1%)" strokeWidth={1.5} fill="url(#priceGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Vault Parameters */}
          <div className="rounded-lg border border-border bg-card">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Vault Parameters</h2>
            </div>
            <div className="divide-y divide-border">
              {[
                ['Underlying Asset', vault.underlyingAsset],
                ['Share Token', vault.shareToken],
                ['Deposit Cap', `${vault.depositCap} sBTC`],
                ['Utilization', `${((vault.totalDeposited / vault.depositCap) * 100).toFixed(1)}%`],
                ['Total Yield Harvested', `${vault.totalYieldHarvested.toFixed(3)} sBTC`],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-mono text-foreground">{val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs text-muted-foreground">Contract Owner</span>
                <AddressBadge address={vault.contractOwner} explorerLink />
              </div>
            </div>
          </div>

          {vault.sharePrice === 0 && (
            <div className="rounded-md border border-border bg-secondary p-3">
              <p className="text-xs text-muted-foreground">
                This vault has no deposits yet. The first depositor sets the initial share price at a <span className="font-mono text-foreground">1:1</span> ratio.
              </p>
            </div>
          )}

          {/* Recent Vault Activity */}
          {pageLoading ? (
            <SkeletonTable rows={4} />
          ) : (
            <div className="rounded-lg border border-border bg-card animate-fade-in">
              <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Recent Vault Activity</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] uppercase tracking-wider">Action</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider">User</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Amount</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right hidden sm:table-cell">Shares</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right hidden sm:table-cell">Block</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaultTxs.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm capitalize">{tx.type}</TableCell>
                      <TableCell><AddressBadge address={tx.userAddress} /></TableCell>
                      <TableCell className="text-right font-mono text-sm">{tx.amount.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono text-sm hidden sm:table-cell">{tx.shares.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono text-sm hidden sm:table-cell">{tx.blockHeight}</TableCell>
                      <TableCell className="text-right"><StatusBadge status={tx.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Right Column — Action Panel */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 rounded-lg border border-border bg-card">
            {/* Inline success banner */}
            {successMessage && (
              <div className="flex items-center gap-2 px-4 py-3 border-b border-success/20 bg-success/5 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-medium text-success">{successMessage}</span>
              </div>
            )}

            <Tabs defaultValue="deposit">
              <TabsList className="w-full rounded-none rounded-t-lg border-b border-border bg-secondary h-11 p-0">
                <TabsTrigger value="deposit" className="flex-1 text-xs font-semibold uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-card data-[state=active]:shadow-none h-full">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw" className="flex-1 text-xs font-semibold uppercase tracking-wider rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-card data-[state=active]:shadow-none h-full">Withdraw</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="p-4 space-y-4">
                {loading && <PendingTxBanner />}
                {sbtcBalance === 0 && !loading && <ZeroBalanceCallout />}

                <AmountInput value={depositAmount} onChange={setDepositAmount} maxAmount={sbtcBalance} symbol="sBTC" label="Deposit Amount" />

                {exceedsCap && depositNum > 0 && (
                  <p className="text-xs text-destructive">
                    Exceeds vault deposit cap. Maximum: <span className="font-mono">{remainingCap.toFixed(4)}</span> sBTC.
                  </p>
                )}

                {depositNum > 0 && !exceedsCap && (
                  <div className="space-y-2 rounded-md bg-secondary p-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Shares to receive</span>
                      <span className="font-mono text-foreground">{sharesToReceive.toFixed(4)} {vault.shareToken}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Exchange rate</span>
                      <span className="font-mono text-foreground">
                        1 sBTC = {(1 / effectiveSharePrice).toFixed(4)} {vault.shareToken}
                        {vault.sharePrice === 0 && <span className="text-muted-foreground ml-1">(1:1)</span>}
                      </span>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full h-11 text-sm font-semibold"
                  disabled={depositNum <= 0 || depositNum > sbtcBalance || exceedsCap || loading}
                  onClick={() => handleAction('deposit')}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deposit sBTC'}
                </Button>
              </TabsContent>

              <TabsContent value="withdraw" className="p-4 space-y-4">
                {loading && <PendingTxBanner />}

                <AmountInput value={withdrawAmount} onChange={setWithdrawAmount} maxAmount={position?.sharesHeld || 0} symbol={vault.shareToken} label="Withdraw Shares" />
                {withdrawNum > 0 && (
                  <div className="space-y-2 rounded-md bg-secondary p-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">sBTC to receive</span>
                      <span className="font-mono text-foreground">{sbtcToReceive.toFixed(4)} sBTC</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Exchange rate</span>
                      <span className="font-mono text-foreground">1 {vault.shareToken} = {effectiveSharePrice.toFixed(4)} sBTC</span>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full h-11 text-sm font-semibold"
                  disabled={withdrawNum <= 0 || withdrawNum > (position?.sharesHeld || 0) || loading}
                  onClick={() => handleAction('withdraw')}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Withdraw'}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
