import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import { DEPLOYER } from '@/config/contracts';
import { getVaultById } from '@/config/vaults';
import { SBTC_DECIMALS } from '@/lib/constants';

const UNIT = 10 ** SBTC_DECIMALS;

interface DepositParams {
  vaultId: string;
  amount: number;
}

interface WithdrawParams {
  vaultId: string;
  shares: number;
}

interface MintParams {
  amount: number;
  recipient: string;
}

/**
 * Deposit sBTC into a vault via wallet-signed contract call.
 */
export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vaultId, amount }: DepositParams) => {
      const vault = getVaultById(vaultId);
      if (!vault) throw new Error('Vault not found');

      const amountSats = Math.floor(amount * UNIT);

      const result = await request('stx_callContract', {
        contract: `${DEPLOYER}.${vault.contractName}`,
        functionName: 'deposit',
        functionArgs: [Cl.uint(amountSats)],
        network: 'testnet',
      });

      return { txId: result.txid, vaultId, amount };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vault-data', variables.vaultId] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Withdraw sBTC from a vault by burning shares via wallet-signed contract call.
 */
export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vaultId, shares }: WithdrawParams) => {
      const vault = getVaultById(vaultId);
      if (!vault) throw new Error('Vault not found');

      const sharesSats = Math.floor(shares * UNIT);

      const result = await request('stx_callContract', {
        contract: `${DEPLOYER}.${vault.contractName}`,
        functionName: 'withdraw',
        functionArgs: [Cl.uint(sharesSats)],
        network: 'testnet',
      });

      return { txId: result.txid, vaultId, shares };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vault-data', variables.vaultId] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Mint mock sBTC (testnet only) via wallet-signed contract call.
 */
export function useMintSbtc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, recipient }: MintParams) => {
      const amountSats = Math.floor(amount * UNIT);

      const result = await request('stx_callContract', {
        contract: `${DEPLOYER}.mock-sbtc`,
        functionName: 'mint',
        functionArgs: [Cl.uint(amountSats), Cl.standardPrincipal(recipient)],
        network: 'testnet',
      });

      return { txId: result.txid };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
}
