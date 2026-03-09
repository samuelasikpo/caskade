import { useMutation, useQueryClient } from '@tanstack/react-query';
import { openContractCall } from '@stacks/connect';
import { uintCV, principalCV } from '@stacks/transactions';
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
    mutationFn: ({ vaultId, amount }: DepositParams) => {
      const vault = getVaultById(vaultId);
      if (!vault) throw new Error('Vault not found');

      const amountSats = Math.floor(amount * UNIT);

      return new Promise<{ txId: string; vaultId: string; amount: number }>((resolve, reject) => {
        openContractCall({
          contractAddress: DEPLOYER,
          contractName: vault.contractName,
          functionName: 'deposit',
          functionArgs: [uintCV(amountSats)],
          network: 'testnet',
          onFinish: (data) => {
            resolve({ txId: data.txId, vaultId, amount });
          },
          onCancel: () => {
            reject(new Error('Transaction cancelled by user'));
          },
        });
      });
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
    mutationFn: ({ vaultId, shares }: WithdrawParams) => {
      const vault = getVaultById(vaultId);
      if (!vault) throw new Error('Vault not found');

      const sharesSats = Math.floor(shares * UNIT);

      return new Promise<{ txId: string; vaultId: string; shares: number }>((resolve, reject) => {
        openContractCall({
          contractAddress: DEPLOYER,
          contractName: vault.contractName,
          functionName: 'withdraw',
          functionArgs: [uintCV(sharesSats)],
          network: 'testnet',
          onFinish: (data) => {
            resolve({ txId: data.txId, vaultId, shares });
          },
          onCancel: () => {
            reject(new Error('Transaction cancelled by user'));
          },
        });
      });
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
    mutationFn: ({ amount, recipient }: MintParams) => {
      const amountSats = Math.floor(amount * UNIT);

      return new Promise<{ txId: string }>((resolve, reject) => {
        openContractCall({
          contractAddress: DEPLOYER,
          contractName: 'mock-sbtc',
          functionName: 'mint',
          functionArgs: [uintCV(amountSats), principalCV(recipient)],
          network: 'testnet',
          onFinish: (data) => {
            resolve({ txId: data.txId });
          },
          onCancel: () => {
            reject(new Error('Transaction cancelled by user'));
          },
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
}
