import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/store/walletStore';
import { STALE_TIMES } from '@/lib/constants';

export interface Balances {
  sbtcBalance: number;
  stxBalance: number;
  shareBalances: Record<string, number>; // vaultId → share balance
}

/**
 * Fetch user token balances.
 * Currently returns walletStore values — swap for Hiro API GET /balances in Phase 3.
 */
export function useBalances(address: string | null) {
  const { sbtcBalance, stxBalance } = useWalletStore();

  return useQuery<Balances>({
    queryKey: ['balances', address],
    queryFn: async () => {
      // TODO: Replace with Hiro API fetch → /extended/v1/address/:addr/balances
      return {
        sbtcBalance,
        stxBalance,
        shareBalances: {
          'sbtc-vault': 1.4521,
          'auto-compound-vault': 0.8932,
        },
      };
    },
    enabled: !!address,
    staleTime: STALE_TIMES.userBalance,
    refetchOnWindowFocus: true,
    refetchInterval: STALE_TIMES.userBalance,
  });
}
