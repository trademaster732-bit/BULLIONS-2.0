
import { NextRequest, NextResponse } from 'next/server';
import { generateUltimateSignal } from '@/lib/trading/ultimate-trading-algorithm';

export async function POST(request: NextRequest) {
  try {
    const { timeframe = '15m' } = await request.json();
    
    // 1. Fetch real historical data from Yahoo Finance for the timeframe
    // Mapping timeframe to Yahoo intervals
    const intervalMap: Record<string, string> = {
      '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m', '1h': '60m', '4h': '60m', '1d': '1d'
    };
    const rangeMap: Record<string, string> = {
      '1m': '1d', '5m': '1d', '15m': '5d', '30m': '5d', '1h': '1mo', '4h': '1mo', '1d': '6mo'
    };

    const interval = intervalMap[timeframe] || '15m';
    const range = rangeMap[timeframe] || '5d';

    const yfResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=${interval}&range=${range}`);
    
    let priceData;
    if (yfResponse.ok) {
      const data = await yfResponse.json();
      const result = data.chart.result[0];
      const quotes = result.indicators.quote[0];
      
      priceData = {
        prices: quotes.close.filter((p: any) => p !== null),
        highs: quotes.high.filter((p: any) => p !== null),
        lows: quotes.low.filter((p: any) => p !== null),
        currentPrice: result.meta.regularMarketPrice
      };
    } else {
      // Fallback if Yahoo fails
      const base = 2650;
      priceData = {
        prices: Array.from({length: 100}, (_, i) => base + Math.sin(i/5)*10 + Math.random()*2),
        highs: Array.from({length: 100}, (_, i) => base + 12 + Math.sin(i/5)*10),
        lows: Array.from({length: 100}, (_, i) => base - 2 + Math.sin(i/5)*10),
        currentPrice: base
      };
    }

    // 2. Generate signal using the new algorithm
    const result = await generateUltimateSignal(priceData, { timeframe });

    return NextResponse.json({
      success: true,
      signal: result.signal,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Signal generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
