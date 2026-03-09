/**
 * Stacks contract configuration for Caskade vaults (testnet).
 */

export const DEPLOYER = 'ST1CKX9QGPDXZNW2MRHN6866VZYKN1DCJCMG1AY38';

export const CONTRACTS = {
  mockSbtc: {
    name: 'mock-sbtc',
    address: `${DEPLOYER}.mock-sbtc`,
  },
  sbtcVault: {
    name: 'sbtc-vault',
    address: `${DEPLOYER}.sbtc-vault`,
  },
  autoCompoundVault: {
    name: 'auto-compound-vault',
    address: `${DEPLOYER}.auto-compound-vault`,
  },
} as const;

/** Read-only contract functions available on vaults */
export const READ_FUNCTIONS = [
  'get-balance',
  'get-total-assets',
  'get-total-shares',
  'get-shares-of',
  'convert-to-shares',
  'convert-to-assets',
  'get-max-deposit',
  'get-max-withdraw',
  'get-symbol',
  'get-total-yield-harvested',
] as const;

/** Write contract functions */
export const WRITE_FUNCTIONS = {
  deposit: 'deposit',
  withdraw: 'withdraw',
  mint: 'mint',
} as const;
