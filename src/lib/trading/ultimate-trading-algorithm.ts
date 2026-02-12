
'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SignalStrength } from '@/lib/types';

interface TradeResult {
  status: 'WIN' | 'LOSS' | 'PARTIAL_WIN' | 'OPEN';
  profitTakenAtTP1: boolean;
  profitTakenAtTP2: boolean;
  maxProfitReached: number;
  slHitAfterTP1: boolean;
  finalOutcome: 'TP1_HIT' | 'TP2_HIT' | 'SL_HIT' | 'TP1_HIT_THEN_SL';
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Internal helper function - not exported
function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (highs.length < 2 || lows.length < 2 || closes.length < 2) return 0;
  let trueRanges = [];
  for (let i = 1; i < highs.length; i++) {
    const tr1 = highs[i] - lows[i];
    const tr2 = Math.abs(highs[i] - (closes[i-1] || 0));
    const tr3 = Math.abs(lows[i] - (closes[i-1] || 0));
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  if (trueRanges.length === 0) return 0;
  const relevantTrueRanges = trueRanges.slice(-period);
  return relevantTrueRanges.reduce((a, b) => a + b, 0) / relevantTrueRanges.length;
}

// Internal helper function - not exported
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
}

// Internal helper function - not exported
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(((prices[i] - (prices[i-1] || 0)) / (prices[i-1] || 1)));
  }
  if (returns.length === 0) return 0;
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  return Math.sqrt(variance);
}

// Internal helper function - not exported
function calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length <= period) {
        return 50; // Not enough data, return neutral RSI
    }

    let gains = 0;
    let losses = 0;

    // Calculate initial average gains and losses
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - (prices[i - 1] || 0);
        if (change > 0) {
            gains += change;
        } else {
            losses -= change; // losses are positive
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Smooth the rest
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - (prices[i - 1] || 0);
        if (change > 0) {
            avgGain = (avgGain * (period - 1) + change) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgLoss = (avgLoss * (period - 1) - change) / period;
            avgGain = (avgGain * (period - 1)) / period;
        }
    }
    
    if (avgLoss === 0) {
        return 100; // All gains, RSI is 100
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}


// 1. MARKET REGIME DETECTION
export async function detectMarketRegime(prices: number[]): Promise<string> {
    if (prices.length < 50) return 'UNKNOWN';
    
    const recentPrices = prices.slice(-50);
    const sma20 = calculateSMA(recentPrices, 20);
    const sma50 = calculateSMA(recentPrices, 50);
    const currentPrice = recentPrices[recentPrices.length - 1] || 0;
    
    // Calculate volatility
    const returns = [];
    for (let i = 1; i < recentPrices.length; i++) {
        returns.push(Math.abs(((recentPrices[i] - (recentPrices[i-1] || 0)) / (recentPrices[i-1] || 1))));
    }
    const volatility = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    
    // Calculate trend strength
    const trendStrength = currentPrice > 0 ? Math.abs((currentPrice - sma50) / currentPrice) : 0;
    
    // Detect regime
    if (volatility > 0.025) return 'HIGH_VOLATILITY';
    
    if (currentPrice > sma20 && sma20 > sma50 && trendStrength > 0.02) {
        return 'STRONG_UPTREND';
    } else if (currentPrice < sma20 && sma20 < sma50 && trendStrength > 0.02) {
        return 'STRONG_DOWNTREND';
    } else if (volatility < 0.01 && trendStrength < 0.01) {
        return 'RANGING';
    } else {
        return 'MIXED';
    }
}

// 2. TIME-OF-DAY OPTIMIZATION
export async function getCurrentTradingSession(): Promise<string> {
    const now = new Date();
    const hour = now.getUTCHours();
    
    // Asian Session: 00:00 - 08:00 UTC
    if (hour >= 0 && hour < 8) return 'ASIAN';
    
    // London Session: 08:00 - 16:00 UTC
    if (hour >= 8 && hour < 16) return 'LONDON';
    
    // New York Session: 13:00 - 21:00 UTC (overlaps with London)
    if (hour >= 13 && hour < 21) return 'NEWYORK';
    
    // Sydney/Overnight
    return 'OVERNIGHT';
}

// 3. SENTIMENT ANALYSIS INTEGRATION
export async function getMarketSentimentScore(): Promise<number> {
    try {
        // Fear & Greed Index
        const fngResponse = await fetch('https://api.alternative.me/fng/');
        const fngData = await fngResponse.json();
        const fearGreedScore = parseInt(fngData.data[0].value) || 50;
        
        // Time-based sentiment (gold often has patterns)
        const hour = new Date().getUTCHours();
        const timeSentiment = hour >= 8 && hour <= 16 ? 10 : -5;
        
        // Day of week sentiment
        const day = new Date().getUTCDay();
        const daySentiment = day === 0 || day === 6 ? -10 : 5; // Lower sentiment weekends
        
        // Combined sentiment (0-100 scale)
        let sentiment = fearGreedScore + timeSentiment + daySentiment;
        return Math.max(0, Math.min(100, sentiment));
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return 50; // Neutral fallback
    }
}

// 4. TRADE OUTCOME TRACKING & PROFIT LOCKING
export async function trackTradeOutcome(trade: any, currentPrice: number): Promise<any> {
    const isBuy = trade.action === 'BUY';
    let updatedTrade = { ...trade };
    
    // Check TP1 hit
    if (!trade.tp1Hit) {
        if ((isBuy && currentPrice >= trade.takeProfit1) || (!isBuy && currentPrice <= trade.takeProfit1)) {
            updatedTrade.tp1Hit = true;
            updatedTrade.tp1HitTime = new Date().toISOString();
            updatedTrade.profitStatus = 'TP1_HIT';
            updatedTrade.partialProfitLocked = true;
            
            // 🎯 CRITICAL: Adjust stop loss to entry price (breakeven) when TP1 hits
            updatedTrade.stopLoss = trade.entryPrice;
            console.log(`✅ TP1 HIT! Profit locked. Stop loss moved to breakeven at: ${trade.entryPrice}`);
        }
    }
    
    // Check TP2 hit (only if TP1 already hit)
    if (trade.tp1Hit && !trade.tp2Hit) {
        if ((isBuy && currentPrice >= trade.takeProfit2) || (!isBuy && currentPrice <= trade.takeProfit2)) {
            updatedTrade.tp2Hit = true;
            updatedTrade.tp2HitTime = new Date().toISOString();
            updatedTrade.profitStatus = 'TP2_HIT';
            updatedTrade.fullProfitLocked = true;
            console.log(`🎉 TP2 HIT! Full profit taken.`);
        }
    }
    
    // Check SL hit - BUT WITH CRITICAL LOGIC:
    if (!trade.slHit) {
        if ((isBuy && currentPrice <= trade.stopLoss) || (!isBuy && currentPrice >= trade.stopLoss)) {
            updatedTrade.slHit = true;
            updatedTrade.slHitTime = new Date().toISOString();
            
            // 🎯 CRITICAL: Determine final outcome
            if (trade.tp1Hit) {
                updatedTrade.profitStatus = 'TP1_HIT_THEN_SL';
                updatedTrade.finalOutcome = 'PARTIAL_WIN'; // NOT A LOSS!
                console.log(`⚠️ SL hit AFTER TP1. Trade recorded as PARTIAL WIN (TP1 profit locked).`);
            } else {
                updatedTrade.profitStatus = 'SL_HIT';
                updatedTrade.finalOutcome = 'LOSS';
                console.log(`❌ SL hit before TP1. Trade recorded as LOSS.`);
            }
        }
    }
    
    if (isBuy) {
        updatedTrade.maxProfitReached = Math.max(updatedTrade.maxProfitReached || 0, currentPrice);
    } else {
        updatedTrade.maxProfitReached = Math.min(updatedTrade.maxProfitReached || Infinity, currentPrice);
    }
    
    return updatedTrade;
}

// 5. USER FEEDBACK LOOP
export async function processUserFeedback(tradeId: string, userRating: number, userComment: string): Promise<void> {
    console.log(`User feedback for trade ${tradeId}: ${userRating}/5 - "${userComment}"`);
    const feedback = { tradeId, rating: userRating, comment: userComment, timestamp: new Date().toISOString() };
    if (typeof window !== 'undefined') {
        const existingFeedback = JSON.parse(localStorage.getItem('bullions_feedback') || '[]');
        existingFeedback.push(feedback);
        localStorage.setItem('bullions_feedback', JSON.stringify(existingFeedback));
        if (userRating <= 2) {
            console.log('Negative feedback received. Will adjust parameters for future signals.');
        }
    }
}


// 6. ENHANCED MULTI-TIMEFRAME CONFIRMATION
export async function getMultiTimeframeData(): Promise<{ score: number; confidence: number; details: any }> {
    try {
        const getTrend = (prices: number[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
            if (prices.length < 2) return 'NEUTRAL';
            const sma10 = calculateSMA(prices, 10);
            const sma20 = calculateSMA(prices, 20);
            if (sma10 > sma20) return 'BULLISH';
            if (sma10 < sma20) return 'BEARISH';
            return 'NEUTRAL';
        };

        const fetchData = async (range: string, interval: string) => {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=${range}&interval=${interval}`);
            if (!response.ok) return { trend: 'NEUTRAL', prices: [] };
            const data = await response.json();
            const prices = data.chart.result[0]?.indicators.quote[0]?.close || [];
            return { trend: getTrend(prices), prices };
        };

        const [weekly, daily, fourHour] = await Promise.all([
            fetchData('1y', '1wk'),
            fetchData('3mo', '1d'),
            fetchData('1mo', '60m') // 60m interval to simulate 4H
        ]);

        const trends = [weekly.trend, daily.trend, fourHour.trend];
        const bullishCount = trends.filter(t => t === 'BULLISH').length;
        const bearishCount = trends.filter(t => t === 'BEARISH').length;

        let alignmentScore = 0;
        let confidence = 0;

        if (bullishCount >= 2) {
            alignmentScore = 1; // Bullish alignment
            confidence = bullishCount / 3;
        } else if (bearishCount >= 2) {
            alignmentScore = -1; // Bearish alignment
            confidence = bearishCount / 3;
        }

        return {
            score: alignmentScore,
            confidence,
            details: {
                weekly: weekly.trend,
                daily: daily.trend,
                fourHour: fourHour.trend,
            }
        };

    } catch(e) {
        console.error("HTF analysis failed:", e);
        return { score: 0, confidence: 0, details: {} };
    }
}

// 7. VOLUME & MOMENTUM CONFIRMATION
async function getMomentumConfirmation(prices: number[], volume: number, averageVolume: number, action: 'BUY' | 'SELL'): Promise<{ confirmed: boolean; reason: string; strengthModifier: number }> {
    if (prices.length < 15) {
        return { confirmed: false, reason: 'Not enough price data for momentum analysis.', strengthModifier: -0.2 };
    }
    
    const rsi = calculateRSI(prices);
    const rsiConfirmation = action === 'BUY' ? rsi > 52 : rsi < 48; // Stricter RSI
    const priceMomentum = action === 'BUY' 
      ? (prices[prices.length - 1] || 0) > (prices[prices.length - 2] || 0)
      : (prices[prices.length - 1] || 0) < (prices[prices.length - 2] || 0);
    const volumeConfirmation = volume > averageVolume * 0.9; // Volume is at least 90% of average

    const confirmations = [rsiConfirmation, priceMomentum, volumeConfirmation];
    const confirmedCount = confirmations.filter(c => c).length;

    if (confirmedCount === 3) {
        return { confirmed: true, reason: 'RSI, Price, and Volume confirm momentum.', strengthModifier: 1.0 };
    }
    if (confirmedCount === 2) {
        return { confirmed: true, reason: 'Partial momentum confirmation.', strengthModifier: 0.7 };
    }
    if (confirmedCount === 1) {
        return { confirmed: false, reason: 'Weak momentum confirmation.', strengthModifier: 0.4 };
    }
    
    return { confirmed: false, reason: 'No momentum confirmation.', strengthModifier: 0.2 };
}


// Internal helper - not exported
async function getGeminiAnalysis(priceData: any, marketData: any): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `As a gold trading expert, analyze this gold market data:
    Current Price: $${priceData.currentPrice}
    Trend: ${marketData.trend}
    Volatility: ${marketData.volatility}
    Market Regime: ${marketData.regime}
    
    Provide ONLY JSON response: {"action": "BUY" or "SELL" or "HOLD", "confidence": 1-100, "reason": "brief explanation"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { action: 'HOLD', confidence: 50, reason: 'AI analysis failed' };
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return { action: 'HOLD', confidence: 50, reason: 'AI service unavailable' };
  }
}

// MAIN ALGORITHM ORCHESTRATOR
export async function generateUltimateSignal(priceData: any, marketData: any): Promise<any> {
  try {
      const currentPrice = priceData.currentPrice;
      const allPrices = priceData.prices || [];
      const volatility = calculateVolatility(allPrices);
      const marketRegime = await detectMarketRegime(allPrices);
      const htfAnalysis = await getMultiTimeframeData();

      const factors = {
          volatilityScore: (volatility < 0.015 ? 1 : -1) * 5,
          regimeScore: (marketRegime === 'STRONG_UPTREND' ? 15 : marketRegime === 'STRONG_DOWNTREND' ? -15 : 0),
          timeframeScore: htfAnalysis.score * (htfAnalysis.confidence * 15),
          sentimentScore: (await getMarketSentimentScore() - 50) * 0.2, // scale it
      };

      const aiAnalysis = await getGeminiAnalysis({currentPrice}, {
          trend: factors.regimeScore > 0 ? 'BULLISH' : 'BEARISH',
          volatility: volatility,
          regime: marketRegime,
      });

      const totalScore = 50 
        + factors.volatilityScore 
        + factors.regimeScore 
        + factors.timeframeScore 
        + factors.sentimentScore 
        + ((aiAnalysis.confidence - 50) * 0.2);
        
      const preliminaryAction = totalScore > 55 ? 'BUY' : totalScore < 45 ? 'SELL' : aiAnalysis.action;

      if (preliminaryAction === 'HOLD') {
          return {
              success: true,
              signal: {
                  action: 'HOLD',
                  confidence: 0,
                  strength: 'RISKY',
                  reason: 'Market conditions are neutral or conflicting. No clear signal.',
              },
              analysis: { totalScore, factors, reason: 'Neutral market state' }
          };
      }

      const momentum = await getMomentumConfirmation(
          allPrices, 
          marketData.volume || 0, 
          marketData.averageVolume || 0,
          preliminaryAction
      );
      
      const signal = await generateFinalSignal(totalScore, currentPrice, priceData, aiAnalysis, momentum.strengthModifier);
      
      return {
          success: true,
          signal: signal,
          analysis: {
            totalScore,
            factors,
            aiAnalysis,
            momentum,
            confidence: signal.confidence,
            strength: signal.strength,
            timestamp: new Date().toISOString()
          }
      };
    
  } catch (error: any) {
    console.error('Ultimate algorithm error:', error);
    return { success: false, error: 'Algorithm processing failed', details: error.message };
  }
}

// Internal helper - not exported
async function generateFinalSignal(totalScore: number, currentPrice: number, priceData: any, aiAnalysis: any, momentumModifier: number): Promise<any> {
  const atr = calculateATR(priceData.highs || [], priceData.lows || [], priceData.prices || [], 14);
  const baseAction = totalScore > 55 ? 'BUY' : totalScore < 45 ? 'SELL' : aiAnalysis.action;
  
  if (baseAction === 'HOLD') {
      return {
          action: 'HOLD',
          confidence: 0,
          strength: 'RISKY',
          reason: 'Market conditions are neutral.',
          entryPrice: currentPrice, takeProfit1: 0, takeProfit2: 0, stopLoss: 0,
      };
  }
  
  let baseConfidence = Math.abs(totalScore - 50) * 1.9;
  let finalConfidence = Math.min(95, baseConfidence * momentumModifier);

  let strength: SignalStrength;
  if (finalConfidence > 80) {
      strength = 'STRONG';
  } else if (finalConfidence > 60) {
      strength = 'MODERATE';
  } else {
      strength = 'RISKY';
      finalConfidence = Math.max(30, finalConfidence); // Ensure risky signals still have some confidence
  }


  const isBuy = baseAction === 'BUY';
  const marketRegime = await detectMarketRegime(priceData.prices || []);
  const regimeMultiplier = marketRegime === 'HIGH_VOLATILITY' ? 2.0 : 1.5;
  
  const stopLossDistance = atr > 0 ? atr * regimeMultiplier : currentPrice * 0.005; // Fallback SL
  const takeProfit1Distance = atr > 0 ? atr * (regimeMultiplier * 1.2) : currentPrice * 0.006; // TP1 is closer
  const takeProfit2Distance = atr > 0 ? atr * (regimeMultiplier * 2.5) : currentPrice * 0.012; // TP2 is further
  
  const stopLoss = isBuy ? currentPrice - stopLossDistance : currentPrice + stopLossDistance;
  const takeProfit1 = isBuy ? currentPrice + takeProfit1Distance : currentPrice - takeProfit1Distance;
  const takeProfit2 = isBuy ? currentPrice + takeProfit2Distance : currentPrice - takeProfit2Distance;

  const session = await getCurrentTradingSession();
  const sentimentScore = await getMarketSentimentScore();

  return {
      action: baseAction,
      confidence: parseFloat(finalConfidence.toFixed(1)),
      strength: strength,
      reason: `[${strength}] AI: ${aiAnalysis.reason} (Score: ${totalScore.toFixed(1)}, Regime: ${marketRegime})`,
      entryPrice: currentPrice,
      takeProfit1: parseFloat(takeProfit1.toFixed(2)),
      takeProfit2: parseFloat(takeProfit2.toFixed(2)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      riskRewardRatio: stopLossDistance > 0 ? (takeProfit1Distance / stopLossDistance).toFixed(2) : "N/A",
      tradeType: takeProfit1Distance < (atr * 2.5) ? 'SCALP' : 'SWING',
      marketRegime: marketRegime,
      tradingSession: session,
      sentimentScore: sentimentScore, 
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      profitStatus: 'OPEN',
      tp1Hit: false, 
      tp2Hit: false, 
      slHit: false 
  };
}
