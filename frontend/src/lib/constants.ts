/**
 * Application-wide constants.
 */

// --- Hiro API endpoint templates ---
export const HIRO_ENDPOINTS = {
  balances: (address: string) => `/extended/v1/address/${address}/balances`,
  transactions: (address: string) => `/extended/v1/address/${address}/transactions`,
  contractEvents: (contractId: string) => `/extended/v1/contract/${contractId}/events`,
  txStatus: (txId: string) => `/extended/v1/tx/${txId}`,
} as const;

// --- React Query stale times ---
export const STALE_TIMES = {
  readOnly: 30_000,       // 30s — vault TVL, share price
  userBalance: 60_000,    // 60s — user token balances
  btcPrice: 60_000,       // 60s — BTC/USD price
  transactions: 120_000,  // 2min — TX history
} as const;

// --- Error messages ---
export const ERRORS = {
  WRONG_NETWORK: 'Please switch to testnet in your wallet to use Caskade.',
  RPC_UNAVAILABLE: 'Unable to reach the Stacks node. Please try again later.',
  DEPOSIT_EXCEEDS_CAP: 'Amount exceeds remaining vault capacity.',
  ZERO_BALANCE: 'You have no sBTC. Mint test tokens to get started.',
  TX_FAILED: 'Transaction failed. Please try again.',
  WALLET_REJECTED: 'Transaction was rejected by your wallet.',
} as const;

// --- Misc ---
export const BTC_PRICE_FALLBACK = 67_432;
export const SBTC_DECIMALS = 8;
export const TX_CONFIRM_POLL_INTERVAL = 5_000; // 5s
