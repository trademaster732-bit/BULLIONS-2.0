'use server';

import { calculateSMA } from '@/lib/trading/utils';

/**
 * Fetches historical daily data for Gold from Yahoo Finance to determine the higher timeframe trend.
 * @returns {Promise<'BULLISH' | 'BEARISH' | 'NEUTRAL'>} The determined trend.
 */
export async function getHigherTimeframeTrend(): Promise<'BULLISH' | 'BEARISH' | 'NEUTRAL'> {
  try {
    // Fetch last 60 days of daily data for Gold futures
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=60d&interval=1d');
    if (!response.ok) {
      console.warn('HTF analysis: Failed to fetch data from Yahoo Finance. Status:', response.status);
      return 'NEUTRAL'; // Graceful fallback
    }

    const data = await response.json();
    const prices = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;

    if (!prices || prices.length < 21) {
      console.warn('HTF analysis: Insufficient price data returned.');
      return 'NEUTRAL';
    }

    const sma10 = calculateSMA(prices, 10);
    const sma20 = calculateSMA(prices, 20);
    const currentPrice = prices[prices.length - 1];

    if (currentPrice > sma10 && sma10 > sma20) {
      return 'BULLISH';
    } else if (currentPrice < sma10 && sma10 < sma20) {
      return 'BEARISH';
    } else {
      return 'NEUTRAL';
    }
  } catch (error) {
    console.error('Error in getHigherTimeframeTrend:', error);
    return 'NEUTRAL'; // Graceful fallback on any exception
  }
}
