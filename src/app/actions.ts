'use server';

import {
  explainSignalReasoning,
  ExplainSignalReasoningInput,
} from '@/ai/flows/explain-signal-reasoning';
import { 
  generateTradingSignal,
  TradingSignalInput,
} from '@/ai/flows/generate-trading-signal';
import type { Signal } from '@/lib/types';

// Add this helper function to get historical prices
async function getHistoricalPrices(): Promise<number[]> {
  // TODO: Replace with your actual price fetching logic
  // Example: Fetch last 10 prices from Firestore or API
  
  // For now, return dummy data (remove this in production)
  return [
    4570.5, 4572.3, 4575.8, 4580.1, 4582.7, 
    4585.2, 4587.4, 4589.0, 4591.3, 4593.8
  ];
}

export async function generateSignalAction(
  data: TradingSignalInput,
  userId: string,
): Promise<Signal> {
  try {
    // Get historical prices before generating signal
    const prices = await getHistoricalPrices();
    
    // Add the missing required fields to the data
    const enhancedData: TradingSignalInput = {
      ...data,
      prices: prices, // This was missing - causing the error
      volatility: calculateVolatility(prices),
      higherTimeframeTrend: determineTrend(prices),
      session: getCurrentSession(),
    };

    const aiResult = await generateTradingSignal(enhancedData);

    if (!aiResult) {
      throw new Error('AI failed to produce a result.');
    }

    const newSignal: Signal = {
      ...aiResult,
      id: new Date().getTime().toString(),
      userId: userId,
      timeframe: data.timeframe,
      riskRewardRatio: data.riskRewardRatio,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      strength: aiResult.confidence > 80 ? 'STRONG' : aiResult.confidence > 60 ? 'MODERATE' : 'RISKY',
      analysis: {
        reason: aiResult.reason,
        confidence: aiResult.confidence,
        algorithm: 'V1_AI_MODEL_WITH_HISTORY'
      },
    };

    return newSignal;
  } catch (error: any) {
    console.error('Error generating signal:', error);
    throw new Error(error.message || 'Failed to generate trading signal.');
  }
}

export async function explainSignalAction(
  data: ExplainSignalReasoningInput
): Promise<string> {
  try {
    const { explanation } = await explainSignalReasoning(data);
    return explanation;
  } catch (error) {
    console.error('Error explaining signal:', error);
    throw new Error('Failed to get explanation.');
  }
}

// Helper functions - implement these based on your needs
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0.5;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
}

function determineTrend(prices: number[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (prices.length < 5) return 'NEUTRAL';
  
  const firstHalf = prices.slice(0, Math.floor(prices.length/2));
  const secondHalf = prices.slice(Math.floor(prices.length/2));
  
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((avgSecond - avgFirst) / avgFirst) * 100;
  
  if (change > 0.5) return 'BULLISH';
  if (change < -0.5) return 'BEARISH';
  return 'NEUTRAL';
}

function getCurrentSession(): string {
  const hour = new Date().getUTCHours();
  if (hour >= 7 && hour < 16) return 'LONDON';
  if (hour >= 13 && hour < 21) return 'NEWYORK';
  return 'ASIA';
}
