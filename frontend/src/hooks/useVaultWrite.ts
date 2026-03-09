import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DepositParams {
  vaultId: string;
  amount: number;
}

interface WithdrawParams {
  vaultId: string;
  shares: number;
}

/**
 * Deposit into a vault.
 * Currently simulates a 1.5s TX — swap for openContractCall in Phase 3.
 */
export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vaultId, amount }: DepositParams) => {
      // TODO: Replace with openContractCall → deposit(amount)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { txId: `0x${Math.random().toString(16).slice(2, 10)}...mock`, vaultId, amount };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vault-data', variables.vaultId] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Withdraw from a vault.
 * Currently simulates a 1.5s TX — swap for openContractCall in Phase 3.
 */
export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vaultId, shares }: WithdrawParams) => {
      // TODO: Replace with openContractCall → withdraw(shares)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { txId: `0x${Math.random().toString(16).slice(2, 10)}...mock`, vaultId, shares };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vault-data', variables.vaultId] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
