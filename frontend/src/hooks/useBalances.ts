import { useQuery } from '@tanstack/react-query';
import { STALE_TIMES, SBTC_DECIMALS, HIRO_ENDPOINTS } from '@/lib/constants';
import { getApiUrl } from '@/config/network';
import { DEPLOYER } from '@/config/contracts';

export interface Balances {
  sbtcBalance: number;
  stxBalance: number;
  shareBalances: Record<string, number>; // vaultId → share balance
}

const UNIT = 10 ** SBTC_DECIMALS;

/**
 * Fetch user token balances from the Hiro API.
 */
export function useBalances(address: string | null) {
  return useQuery<Balances>({
    queryKey: ['balances', address],
    queryFn: async () => {
      if (!address) return { sbtcBalance: 0, stxBalance: 0, shareBalances: {} };

      const res = await fetch(`${getApiUrl()}${HIRO_ENDPOINTS.balances(address)}`);
      if (!res.ok) throw new Error('Failed to fetch balances');
      const data = await res.json();

      const stxBalance = Number(data.stx?.balance || 0) / 1_000_000; // STX uses 6 decimals

      // Extract fungible token balances
      const ftBalances = data.fungible_tokens || {};

      // sBTC balance
      const sbtcKey = Object.keys(ftBalances).find(k => k.includes(`${DEPLOYER}.mock-sbtc`));
      const sbtcBalance = sbtcKey ? Number(ftBalances[sbtcKey].balance || 0) / UNIT : 0;

      // Vault share balances
      const shareBalances: Record<string, number> = {};

      const sbtcVaultKey = Object.keys(ftBalances).find(k =>
        k.includes(`${DEPLOYER}.sbtc-vault::caskade-sbtc-share`)
      );
      if (sbtcVaultKey) {
        shareBalances['sbtc-vault'] = Number(ftBalances[sbtcVaultKey].balance || 0) / UNIT;
      }

      const autoVaultKey = Object.keys(ftBalances).find(k =>
        k.includes(`${DEPLOYER}.auto-compound-vault::caskade-auto-share`)
      );
      if (autoVaultKey) {
        shareBalances['auto-compound-vault'] = Number(ftBalances[autoVaultKey].balance || 0) / UNIT;
      }

      return { sbtcBalance, stxBalance, shareBalances };
    },
    enabled: !!address,
    staleTime: STALE_TIMES.userBalance,
    refetchOnWindowFocus: true,
    refetchInterval: STALE_TIMES.userBalance,
  });
}
