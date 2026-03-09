import { useQuery } from '@tanstack/react-query';
import { TRANSACTIONS, type Transaction } from '@/data/mockData';
import { STALE_TIMES } from '@/lib/constants';

/**
 * Fetch user transaction history.
 * Currently returns mock data — swap for Hiro API GET /transactions in Phase 3.
 */
export function useTransactions(address: string | null) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', address],
    queryFn: async () => {
      // TODO: Replace with Hiro API fetch → /extended/v1/address/:addr/transactions
      if (!address) return [];
      return TRANSACTIONS.filter((tx) => tx.userAddress === 'ST1PQ...PGZGM');
    },
    enabled: !!address,
    staleTime: STALE_TIMES.transactions,
    refetchOnWindowFocus: true,
  });
}
