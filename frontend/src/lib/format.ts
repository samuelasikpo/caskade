/**
 * Format an sBTC amount to 8 decimal places
 */
export function formatSbtc(value: number): string {
  return value.toFixed(8);
}

/**
 * Format a number as sBTC with 4 decimal display (common UI usage)
 */
export function formatSbtcShort(value: number): string {
  return value.toFixed(4);
}

/**
 * Format a number as USD with commas and 2 decimal places
 */
export function formatUsd(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Truncate a Stacks address: first 6 + last 4 chars
 */
export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Extract numeric value from a formatted string (e.g., "1.2345 sBTC" → 1.2345)
 */
export function extractNumber(str: string): number | null {
  const match = str.match(/-?[\d,]+\.?\d*/);
  if (!match) return null;
  return parseFloat(match[0].replace(/,/g, ''));
}
