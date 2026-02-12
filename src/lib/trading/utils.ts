/**
 * Calculates the Simple Moving Average (SMA) for a given period.
 * @param prices An array of numbers.
 * @param period The number of periods to calculate the SMA for.
 * @returns The calculated SMA, or 0 if there's not enough data.
 */
export function calculateSMA(prices: number[], period: number): number {
  if (!prices || prices.length < period) {
    return 0;
  }
  const relevantPrices = prices.slice(-period);
  const sum = relevantPrices.reduce((a, b) => a + b, 0);
  return sum / period;
}
