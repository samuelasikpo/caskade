import { useState, useMemo, useEffect } from 'react';
import { VAULT_REGISTRY } from '@/config/vaults';
import { useWalletStore } from '@/store/walletStore';
import { useTransactions } from '@/hooks/useTransactions';
import { StatusBadge } from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PER_PAGE = 25;

export default function Transactions() {
  const [vaultFilter, setVaultFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { address } = useWalletStore();
  const { data: txData, isLoading: loading } = useTransactions(address);

  useEffect(() => {
    document.title = 'Transactions — Caskade';
  }, []);

  const allTx = txData || [];

  const filtered = useMemo(() => {
    return allTx.filter((tx) => {
      if (vaultFilter !== 'all' && tx.vaultId !== vaultFilter) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      return true;
    });
  }, [allTx, vaultFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'deposit') return <ArrowDownLeft className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />;
    if (type === 'withdraw') return <ArrowUpRight className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />;
    return <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground">Full history of your vault interactions</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={vaultFilter} onValueChange={(v) => { setVaultFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] h-9 text-xs bg-secondary border-border">
            <SelectValue placeholder="All Vaults" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vaults</SelectItem>
            {VAULT_REGISTRY.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-9 text-xs bg-secondary border-border">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdraw">Withdrawals</SelectItem>
            <SelectItem value="transfer">Transfers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20 ml-auto" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider">Vault</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right hidden sm:table-cell">Shares</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider hidden md:table-cell">TX ID</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right hidden md:table-cell">Block</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">Time</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <TypeIcon type={tx.type} />
                      <span className="text-sm capitalize">{tx.type}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.vaultName}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{tx.amount.toFixed(4)} <span className="text-muted-foreground">sBTC</span></TableCell>
                  <TableCell className="text-right font-mono text-sm hidden sm:table-cell">{tx.shares.toFixed(4)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a
                      href={`https://explorer.hiro.so/txid/${tx.txId}?chain=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {tx.txId}
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm hidden md:table-cell">{tx.blockHeight}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground" title={tx.timestamp.toISOString()}>
                    {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right"><StatusBadge status={tx.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!loading && filtered.length > PER_PAGE && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
