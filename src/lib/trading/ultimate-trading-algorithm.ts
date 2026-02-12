
'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SignalStrength } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- TECHNICAL INDICATORS ---

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
}

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length <= period) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change; else losses -= change;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgLoss = (avgLoss * (period - 1) - change) / period;
      avgGain = (avgGain * (period - 1)) / period;
    }
  }
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

export function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (highs.length < 2) return 0;
  let trs = [];
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i-1]), Math.abs(lows[i] - closes[i-1])));
  }
  return trs.slice(-period).reduce((a, b) => a + b, 0) / Math.min(trs.length, period);
}

// --- MARKET ANALYSIS ---

export async function getCurrentTradingSession(): Promise<string> {
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 8) return 'ASIAN';
  if (hour >= 8 && hour < 13) return 'LONDON';
  if (hour >= 13 && hour < 16) return 'LONDON_NY_OVERLAP';
  if (hour >= 16 && hour < 21) return 'NEWYORK';
  return 'OVERNIGHT';
}

export async function detectMarketRegime(prices: number[]): Promise<string> {
  if (prices.length < 50) return 'RANGING';
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const currentPrice = prices[prices.length - 1];
  const rsi = calculateRSI(prices);
  
  if (currentPrice > sma20 && sma20 > sma50 && rsi > 60) return 'STRONG_UPTREND';
  if (currentPrice < sma20 && sma20 < sma50 && rsi < 40) return 'STRONG_DOWNTREND';
  if (Math.abs(currentPrice - sma50) / sma50 < 0.002) return 'RANGING';
  return 'VOLATILE';
}

// --- STRATEGY LOGIC ---

async function getGeminiAnalysis(priceData: any, context: any): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Analyze Gold (XAU/USD) for ${context.timeframe} ${context.strategyType} strategy.
    Current Price: $${priceData.currentPrice}
    Session: ${context.session}
    Regime: ${context.regime}
    RSI: ${context.rsi.toFixed(2)}
    SMA20/50: ${context.sma20.toFixed(2)}/${context.sma50.toFixed(2)}
    
    Provide JSON: {"action": "BUY"|"SELL"|"HOLD", "confidence": 0-100, "reason": "short technical reason"}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { action: 'HOLD', confidence: 0, reason: 'AI Parse Error' };
  } catch (e) {
    return { action: 'HOLD', confidence: 0, reason: 'AI Unavailable' };
  }
}

export async function generateUltimateSignal(priceData: any, marketData: any): Promise<any> {
  const prices = (priceData.prices || []).filter((p: any) => typeof p === 'number' && !isNaN(p));
  const currentPrice = priceData.currentPrice;
  const timeframe = marketData.timeframe || '15m';
  const session = await getCurrentTradingSession();
  const regime = await detectMarketRegime(prices);
  
  const rsi = calculateRSI(prices);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const atr = calculateATR(priceData.highs || [], priceData.lows || [], prices, 14);

  // Strategy Switching Logic
  let strategyType = 'DAY_TRADE';
  let riskMultiplier = 1.5;
  let tpMultiplier = 2.0;

  if (['1m', '5m', '15m'].includes(timeframe)) {
    strategyType = 'SCALPING';
    riskMultiplier = session === 'ASIAN' ? 1.0 : 1.2;
    tpMultiplier = 1.5;
  } else {
    strategyType = 'DAY_TRADE';
    riskMultiplier = 2.0;
    tpMultiplier = 3.0;
  }

  const aiAnalysis = await getGeminiAnalysis(priceData, {
    timeframe, strategyType, session, regime, rsi, sma20, sma50
  });

  let action = aiAnalysis.action;
  // Technical Filter
  if (action === 'BUY' && rsi > 75) action = 'HOLD';
  if (action === 'SELL' && rsi < 25) action = 'HOLD';

  if (action === 'HOLD') {
    return { success: true, signal: { action: 'HOLD', reason: 'Neutral conditions' } };
  }

  const slDist = atr > 0 ? atr * riskMultiplier : currentPrice * 0.002;
  const tp1Dist = slDist * (tpMultiplier * 0.6);
  const tp2Dist = slDist * tpMultiplier;

  const isBuy = action === 'BUY';
  const signal = {
    action,
    confidence: aiAnalysis.confidence,
    strength: aiAnalysis.confidence > 80 ? 'STRONG' : aiAnalysis.confidence > 60 ? 'MODERATE' : 'RISKY',
    reason: `[${strategyType}] ${aiAnalysis.reason}`,
    entryPrice: currentPrice,
    takeProfit1: parseFloat((isBuy ? currentPrice + tp1Dist : currentPrice - tp1Dist).toFixed(2)),
    takeProfit2: parseFloat((isBuy ? currentPrice + tp2Dist : currentPrice - tp2Dist).toFixed(2)),
    stopLoss: parseFloat((isBuy ? currentPrice - slDist : currentPrice + slDist).toFixed(2)),
    tradeType: strategyType,
    tradingSession: session,
    marketRegime: regime,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE'
  };

  return { success: true, signal };
}
