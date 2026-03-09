import { useQuery } from '@tanstack/react-query';
import { STALE_TIMES, BTC_PRICE_FALLBACK } from '@/lib/constants';

async function fetchBtcPrice(): Promise<number> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
  );
  if (!res.ok) throw new Error('Failed to fetch BTC price');
  const data = await res.json();
  return data.bitcoin.usd as number;
}

export function useBtcPrice() {
  return useQuery({
    queryKey: ['btc-price'],
    queryFn: fetchBtcPrice,
    staleTime: STALE_TIMES.btcPrice,
    refetchInterval: STALE_TIMES.btcPrice,
    placeholderData: BTC_PRICE_FALLBACK,
    retry: 2,
  });
}
