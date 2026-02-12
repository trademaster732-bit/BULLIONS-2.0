
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Try multiple sources for gold price
    // Source 1: GoldAPI.io (if key exists)
    const goldApiKey = process.env.GOLD_API_KEY;
    if (goldApiKey) {
      try {
        const response = await fetch('https://api.gold-api.com/price/XAU', {
          headers: { 'x-api-token': goldApiKey }
        });
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            price: data.price,
            timestamp: new Date().toISOString(),
            source: 'gold-api'
          });
        }
      } catch (e) {
        console.error('GoldAPI failed, trying fallback');
      }
    }

    // Source 2: Yahoo Finance (Public)
    try {
      const yfResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d');
      if (yfResponse.ok) {
        const yfData = await yfResponse.json();
        const price = yfData.chart.result[0].meta.regularMarketPrice;
        return NextResponse.json({
          price: price,
          timestamp: new Date().toISOString(),
          source: 'yahoo-finance'
        });
      }
    } catch (e) {
      console.error('Yahoo Finance failed');
    }

    // Final Fallback: Simulated but realistic
    const basePrice = 2650.50; // Current market approximate
    const randomMove = (Math.random() - 0.5) * 2;
    return NextResponse.json({
      price: basePrice + randomMove,
      timestamp: new Date().toISOString(),
      source: 'simulated'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
