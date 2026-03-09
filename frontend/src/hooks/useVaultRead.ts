import { useQuery } from '@tanstack/react-query';
import { STALE_TIMES, SBTC_DECIMALS } from '@/lib/constants';
import { getVaultById } from '@/config/vaults';
import { DEPLOYER } from '@/config/contracts';
import { getApiUrl } from '@/config/network';

export interface VaultData {
  tvl: number;
  sharePrice: number;
  totalShares: number;
  apy: number;
  depositCap: number;
  totalDeposited: number;
  totalYieldHarvested: number;
  status: 'active' | 'paused';
}

const UNIT = 10 ** SBTC_DECIMALS;

async function callReadOnly(contractName: string, fnName: string, args: string[] = []): Promise<string> {
  const url = `${getApiUrl()}/v2/contracts/call-read/${DEPLOYER}/${contractName}/${fnName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: DEPLOYER, arguments: args }),
  });
  if (!res.ok) throw new Error(`RPC call failed: ${fnName}`);
  const data = await res.json();
  if (!data.okay) throw new Error(data.cause || `${fnName} returned not okay`);
  return data.result;
}

function extractUint(hex: string): number {
  // Clarity response: (ok uXXX) serialised as hex.
  // The value is a big-endian uint128 after the type prefix bytes.
  // For simple (ok uint) responses the hex is: 0x070100000000000000000000000000000XXX
  // Type 0x07 = (ok ...), 0x01 = uint, then 16 bytes big-endian.
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  // Find the uint marker (01) after the response wrapper
  // For unwrapped uint it starts with 01
  // For (ok uint) it starts with 07 01
  let offset = 0;
  if (clean.startsWith('07')) offset = 2; // skip (ok ...) wrapper
  if (clean.substring(offset, offset + 2) === '01') {
    const numHex = clean.substring(offset + 2, offset + 34);
    return Number(BigInt('0x' + numHex));
  }
  return 0;
}

/**
 * Read vault on-chain state via Stacks RPC read-only calls.
 */
export function useVaultData(vaultId: string) {
  return useQuery<VaultData | null>({
    queryKey: ['vault-data', vaultId],
    queryFn: async () => {
      const vault = getVaultById(vaultId);
      if (!vault) return null;

      const cn = vault.contractName;

      try {
        const [totalAssetsHex, totalSharesHex, sharePriceHex, maxDepositHex] = await Promise.all([
          callReadOnly(cn, 'get-total-assets'),
          callReadOnly(cn, 'get-total-shares'),
          // convert-to-assets(1e8) = share price in sats
          callReadOnly(cn, 'convert-to-assets', [`0x0100000000000000000000000000000000`].map(() =>
            '0x010000000000000000000000005f5e100' // u100000000 = 1e8
          )),
          callReadOnly(cn, 'get-max-deposit', [
            `0x0516${Buffer.from(DEPLOYER).toString('hex')}`.slice(0, 44) // placeholder principal
          ]).catch(() => null),
        ]);

        const totalAssets = extractUint(totalAssetsHex);
        const totalShares = extractUint(totalSharesHex);
        const sharePriceRaw = extractUint(sharePriceHex);
        const sharePrice = sharePriceRaw / UNIT || (totalShares === 0 ? 1 : 1);

        const tvl = totalAssets / UNIT;
        const depositCap = maxDepositHex ? (extractUint(maxDepositHex) + totalAssets) / UNIT : 210000;

        // Try to get yield harvested (only auto-compound has this)
        let totalYieldHarvested = 0;
        if (vault.type === 'auto-compound') {
          try {
            const yieldHex = await callReadOnly(cn, 'get-total-yield-harvested');
            totalYieldHarvested = extractUint(yieldHex) / UNIT;
          } catch {
            // sbtc-vault doesn't have this function
          }
        }

        // APY from yield (simple annualized estimate)
        const apy = tvl > 0 ? (totalYieldHarvested / tvl) * 365 * 100 : 0;

        return {
          tvl,
          sharePrice,
          totalShares: totalShares / UNIT,
          apy: Math.min(apy, 999), // cap display
          depositCap,
          totalDeposited: tvl,
          totalYieldHarvested,
          status: 'active' as const,
        };
      } catch {
        return {
          tvl: 0, sharePrice: 1, totalShares: 0, apy: 0,
          depositCap: 210000, totalDeposited: 0, totalYieldHarvested: 0,
          status: 'paused' as const,
        };
      }
    },
    staleTime: STALE_TIMES.readOnly,
    refetchInterval: STALE_TIMES.readOnly,
  });
}

/**
 * Call convert-to-shares for deposit preview.
 */
export async function previewDeposit(contractName: string, amountSats: bigint): Promise<number> {
  const hex = amountSats.toString(16).padStart(32, '0');
  const result = await callReadOnly(contractName, 'convert-to-shares', [`0x01${hex}`]);
  return extractUint(result);
}

/**
 * Call convert-to-assets for withdraw preview.
 */
export async function previewWithdraw(contractName: string, sharesSats: bigint): Promise<number> {
  const hex = sharesSats.toString(16).padStart(32, '0');
  const result = await callReadOnly(contractName, 'convert-to-assets', [`0x01${hex}`]);
  return extractUint(result);
}
