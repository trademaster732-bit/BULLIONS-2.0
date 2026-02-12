export async function fetchPolygonData(symbol: string, multiplier: number, timespan: string) {
  const apiKey = process.env.POLYGON_API_KEY;
  // We fetch enough candles (100) to ensure indicators like EMA 50/200 have enough data to calculate
  const url = `https://api.polygon.io/v2/aggs/ticker/C:${symbol}/range/${multiplier}/${timespan}/prev?limit=100&apiKey=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) return [];

  // Map Polygon results to a standard format for our algorithm
  return data.results.map((candle: any) => ({
    timestamp: candle.t,
    open: candle.o,
    high: candle.h,
    low: candle.l,
    close: candle.c,
    volume: candle.v
  }));
}
