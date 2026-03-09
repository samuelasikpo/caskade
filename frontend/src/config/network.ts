/**
 * Network configuration for Stacks blockchain.
 */

export type NetworkId = 'testnet' | 'mainnet';

export interface NetworkConfig {
  label: string;
  url: string;
  chainId: number;
  explorerUrl: string;
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  testnet: {
    label: 'Testnet',
    url: 'https://api.testnet.hiro.so',
    chainId: 0x80000000,
    explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
  },
  mainnet: {
    label: 'Mainnet',
    url: 'https://api.mainnet.hiro.so',
    chainId: 1,
    explorerUrl: 'https://explorer.hiro.so',
  },
};

/** Current active network */
export const ACTIVE_NETWORK: NetworkId = 'testnet';

/** Get the Hiro API base URL for a given network */
export function getApiUrl(network: NetworkId = ACTIVE_NETWORK): string {
  return NETWORKS[network].url;
}

/** Get the explorer URL for a given network */
export function getExplorerUrl(network: NetworkId = ACTIVE_NETWORK): string {
  return NETWORKS[network].explorerUrl;
}
