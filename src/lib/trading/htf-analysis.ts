
'use server';
import { calculateSMA } from './ultimate-trading-algorithm';

export async function getHigherTimeframeTrend(): Promise<'BULLISH' | 'BEARISH' | 'NEUTRAL'> {
  try {
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=60d&interval=1d');
    if (!response.ok) return 'NEUTRAL';

    const data = await response.json();
    const prices = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter((p: any) => p !== null);

    if (!prices || prices.length < 21) return 'NEUTRAL';

    const sma10 = calculateSMA(prices, 10);
    const sma20 = calculateSMA(prices, 20);
    const currentPrice = prices[prices.length - 1];

    if (currentPrice > sma10 && sma10 > sma20) return 'BULLISH';
    if (currentPrice < sma10 && sma10 < sma20) return 'BEARISH';
    return 'NEUTRAL';
  } catch (error) {
    return 'NEUTRAL';
  }
}
