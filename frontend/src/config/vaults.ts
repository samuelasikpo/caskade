/**
 * Vault registry — canonical list of Caskade vaults.
 */

import { DEPLOYER } from './contracts';

export type VaultType = 'base' | 'auto-compound';

export interface VaultRegistryEntry {
  id: string;
  name: string;
  shareToken: string;
  contractName: string;
  contractAddress: string;
  type: VaultType;
}

export const VAULT_REGISTRY: VaultRegistryEntry[] = [
  {
    id: 'sbtc-vault',
    name: 'sBTC Base Vault',
    shareToken: 'csBTC',
    contractName: 'sbtc-vault',
    contractAddress: `${DEPLOYER}.sbtc-vault`,
    type: 'base',
  },
  {
    id: 'auto-compound-vault',
    name: 'Auto-Compound Vault',
    shareToken: 'casBTC',
    contractName: 'auto-compound-vault',
    contractAddress: `${DEPLOYER}.auto-compound-vault`,
    type: 'auto-compound',
  },
];

/** Look up a vault by its ID */
export function getVaultById(id: string): VaultRegistryEntry | undefined {
  return VAULT_REGISTRY.find((v) => v.id === id);
}
