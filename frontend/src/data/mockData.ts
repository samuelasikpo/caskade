export interface Vault {
  id: string;
  name: string;
  shareToken: string;
  description: string;
  contractAddress: string;
  tvl: number;
  sharePrice: number;
  totalShares: number;
  apy: number;
  depositCap: number;
  totalDeposited: number;
  totalYieldHarvested: number;
  contractOwner: string;
  underlyingAsset: string;
  status: 'active' | 'paused';
}

export interface Position {
  vaultId: string;
  vaultName: string;
  sharesHeld: number;
  sharePrice: number;
  depositedAmount: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  vaultId: string;
  vaultName: string;
  amount: number;
  shares: number;
  txId: string;
  blockHeight: number;
  timestamp: Date;
  status: 'confirmed' | 'pending' | 'failed';
  userAddress: string;
}

export const VAULTS: Vault[] = [
  {
    id: 'sbtc-base',
    name: 'sBTC Base Vault',
    shareToken: 'csBTC',
    description: 'Core yield vault for sBTC deposits. Generates yield through strategic DeFi allocations on the Stacks ecosystem with conservative risk parameters.',
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-vault-v1',
    tvl: 145.832,
    sharePrice: 1.0234,
    totalShares: 142.512,
    apy: 5.82,
    depositCap: 500,
    totalDeposited: 145.832,
    totalYieldHarvested: 3.241,
    contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    underlyingAsset: 'sBTC',
    status: 'active',
  },
  {
    id: 'sbtc-auto',
    name: 'Auto-Compound Vault',
    shareToken: 'casBTC',
    description: 'Automated compounding vault that reinvests yield back into the vault position, maximizing long-term returns through compound interest mechanics.',
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.auto-compound-v1',
    tvl: 89.445,
    sharePrice: 1.0891,
    totalShares: 82.128,
    apy: 8.14,
    depositCap: 300,
    totalDeposited: 89.445,
    totalYieldHarvested: 5.672,
    contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    underlyingAsset: 'sBTC',
    status: 'active',
  },
];

export const USER_POSITIONS: Position[] = [
  {
    vaultId: 'sbtc-base',
    vaultName: 'sBTC Base Vault',
    sharesHeld: 1.4521,
    sharePrice: 1.0234,
    depositedAmount: 1.45,
  },
  {
    vaultId: 'sbtc-auto',
    vaultName: 'Auto-Compound Vault',
    sharesHeld: 0.8932,
    sharePrice: 1.0891,
    depositedAmount: 0.85,
  },
];

const now = new Date();
export const TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'deposit',
    vaultId: 'sbtc-base',
    vaultName: 'sBTC Base Vault',
    amount: 0.5,
    shares: 0.4886,
    txId: '0x8a3f...b2c1',
    blockHeight: 154823,
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    status: 'confirmed',
    userAddress: 'ST1PQ...PGZGM',
  },
  {
    id: 'tx-2',
    type: 'deposit',
    vaultId: 'sbtc-auto',
    vaultName: 'Auto-Compound Vault',
    amount: 0.85,
    shares: 0.7807,
    txId: '0x3d2e...a4f5',
    blockHeight: 154801,
    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    status: 'confirmed',
    userAddress: 'ST1PQ...PGZGM',
  },
  {
    id: 'tx-3',
    type: 'withdraw',
    vaultId: 'sbtc-base',
    vaultName: 'sBTC Base Vault',
    amount: 0.25,
    shares: 0.2443,
    txId: '0x7c1a...d3e8',
    blockHeight: 154789,
    timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    status: 'confirmed',
    userAddress: 'ST1PQ...PGZGM',
  },
  {
    id: 'tx-4',
    type: 'deposit',
    vaultId: 'sbtc-base',
    vaultName: 'sBTC Base Vault',
    amount: 1.2,
    shares: 1.1726,
    txId: '0xf5b2...c9a1',
    blockHeight: 154756,
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    status: 'confirmed',
    userAddress: 'ST1PQ...PGZGM',
  },
  {
    id: 'tx-5',
    type: 'deposit',
    vaultId: 'sbtc-auto',
    vaultName: 'Auto-Compound Vault',
    amount: 0.15,
    shares: 0.1125,
    txId: '0xa8d4...e7f2',
    blockHeight: 154734,
    timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    status: 'pending',
    userAddress: 'ST2CY...M4TDN',
  },
  {
    id: 'tx-6',
    type: 'withdraw',
    vaultId: 'sbtc-auto',
    vaultName: 'Auto-Compound Vault',
    amount: 0.05,
    shares: 0.0459,
    txId: '0x2e9c...b1d3',
    blockHeight: 154710,
    timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    status: 'confirmed',
    userAddress: 'ST3AM...R8D5P',
  },
  {
    id: 'tx-7',
    type: 'deposit',
    vaultId: 'sbtc-base',
    vaultName: 'sBTC Base Vault',
    amount: 2.0,
    shares: 1.9543,
    txId: '0x6f3a...d8c2',
    blockHeight: 154698,
    timestamp: new Date(now.getTime() - 96 * 60 * 60 * 1000),
    status: 'confirmed',
    userAddress: 'ST4BX...K7E2Q',
  },
  {
    id: 'tx-8',
    type: 'deposit',
    vaultId: 'sbtc-auto',
    vaultName: 'Auto-Compound Vault',
    amount: 0.3,
    shares: 0.2755,
    txId: '0xc4e1...a5b7',
    blockHeight: 154682,
    timestamp: new Date(now.getTime() - 120 * 60 * 60 * 1000),
    status: 'failed',
    userAddress: 'ST1PQ...PGZGM',
  },
];

export function generateSharePriceHistory(days: number) {
  const data = [];
  const now = Date.now();
  let price = 1.0;
  for (let i = days; i >= 0; i--) {
    price += (Math.random() * 0.003 - 0.0005);
    price = Math.max(1.0, price);
    data.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(4)),
    });
  }
  return data;
}
