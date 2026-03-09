import { useQuery } from '@tanstack/react-query';
import { type Transaction } from '@/data/mockData';
import { STALE_TIMES, HIRO_ENDPOINTS } from '@/lib/constants';
import { getApiUrl } from '@/config/network';
import { DEPLOYER } from '@/config/contracts';

const CASKADE_CONTRACTS = [
  `${DEPLOYER}.sbtc-vault`,
  `${DEPLOYER}.auto-compound-vault`,
  `${DEPLOYER}.mock-sbtc`,
];

const VAULT_NAMES: Record<string, string> = {
  'sbtc-vault': 'sBTC Base Vault',
  'auto-compound-vault': 'Auto-Compound Vault',
  'mock-sbtc': 'Mock sBTC',
};

/**
 * Fetch user transaction history from the Hiro API, filtered to Caskade contract calls.
 */
export function useTransactions(address: string | null) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', address],
    queryFn: async () => {
      if (!address) return [];

      const res = await fetch(
        `${getApiUrl()}${HIRO_ENDPOINTS.transactions(address)}?limit=50`
      );
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();

      const txs: Transaction[] = [];

      for (const tx of data.results || []) {
        // Only include contract calls to Caskade contracts
        if (tx.tx_type !== 'contract_call') continue;

        const contractId = tx.contract_call?.contract_id;
        if (!contractId || !CASKADE_CONTRACTS.includes(contractId)) continue;

        const fnName = tx.contract_call?.function_name || '';
        const contractName = contractId.split('.')[1] || '';

        let type: 'deposit' | 'withdraw' | 'transfer' = 'deposit';
        if (fnName === 'withdraw') type = 'withdraw';
        else if (fnName === 'transfer') type = 'transfer';

        // Extract amount from function args
        let amount = 0;
        let shares = 0;
        const args = tx.contract_call?.function_args || [];
        if (args.length > 0 && args[0]?.repr) {
          const val = parseInt(args[0].repr.replace('u', ''), 10);
          if (!isNaN(val)) {
            if (type === 'withdraw') {
              shares = val / 1e8;
            } else {
              amount = val / 1e8;
            }
          }
        }

        // Map contract name to vault ID
        let vaultId = contractName;
        if (contractName === 'mock-sbtc') {
          type = 'deposit'; // mint is treated as a "deposit" of sorts
          vaultId = 'mock-sbtc';
        }

        txs.push({
          id: tx.tx_id,
          type,
          vaultId,
          vaultName: VAULT_NAMES[contractName] || contractName,
          amount,
          shares,
          txId: tx.tx_id,
          blockHeight: tx.block_height || 0,
          timestamp: new Date(tx.burn_block_time_iso || tx.receipt_time_iso || Date.now()),
          status: tx.tx_status === 'success' ? 'confirmed'
            : tx.tx_status === 'pending' ? 'pending'
            : 'failed',
          userAddress: address,
        });
      }

      return txs;
    },
    enabled: !!address,
    staleTime: STALE_TIMES.transactions,
    refetchOnWindowFocus: true,
  });
}
