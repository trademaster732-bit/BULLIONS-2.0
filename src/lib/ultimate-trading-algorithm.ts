'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class UltimateTradingAlgorithm {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  private static finnhubKey = process.env.FINNHUB_API_KEY || '';
  private static riskMetrics: Map<string, { dailyPnL: number, tradesToday: number }> = new Map();
  
  // 1. PRICE ACTION PATTERNS (NEW)
  static detectCandlestickPatterns(prices: number[], highs: number[], lows: number[]): number {
    if (prices.length < 5 || highs.length < 5 || lows.length < 5) return 0;
    
    const recentPrices = prices.slice(-5);
    const recentHighs = highs.slice(-5);
    const recentLows = lows.slice(-5);
    
    // Check for Doji pattern
    const lastCandle = {
      open: prices[prices.length - 2] || prices[0],
      close: prices[prices.length - 1],
      high: highs[highs.length - 1],
      low: lows[lows.length - 1]
    };
    
    const doji = Math.abs(lastCandle.open - lastCandle.close) / (lastCandle.high - lastCandle.low) < 0.1;
    if (doji) return -10; // Indecision
    
    // Check for Hammer/Shooting Star
    const bodySize = Math.abs(lastCandle.open - lastCandle.close);
    const lowerWick = lastCandle.close - lastCandle.low;
    const upperWick = lastCandle.high - lastCandle.close;
    
    // Hammer (bullish reversal)
    if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
      return 15;
    }
    
    // Shooting Star (bearish reversal)
    if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5) {
      return -15;
    }
    
    // Check for Engulfing pattern
    if (prices.length >= 2) {
      const prevCandle = {
        open: prices[prices.length - 3] || prices[0],
        close: prices[prices.length - 2],
        high: highs[highs.length - 2],
        low: lows[lows.length - 2]
      };
      
      // Bullish engulfing
      if (prevCandle.close < prevCandle.open && 
          lastCandle.open < prevCandle.close && 
          lastCandle.close > prevCandle.open) {
        return 20;
      }
      
      // Bearish engulfing
      if (prevCandle.close > prevCandle.open && 
          lastCandle.open > prevCandle.close && 
          lastCandle.close < prevCandle.open) {
        return -20;
      }
    }
    
    return 0;
  }

  // 2. VOLUME ANALYSIS WITH FINNHUB (NEW)
  static async getVolumeAnalysis(symbol: string = 'OANDA:XAU_USD', timeframe: string = '5'): Promise<{volumeScore: number, volumeData: any}> {
    try {
      // Fetch candle data with volume from Finnhub
      const now = Math.floor(Date.now() / 1000);
      const from = now - (parseInt(timeframe) * 60 * 50); // 50 candles back
      
      const response = await fetch(
        `https://finnhub.io/api/v1/crypto/candle?symbol=BINANCE:BTCUSDT&resolution=${timeframe}&from=${from}&to=${now}&token=${this.finnhubKey}`
      );
      
      if (!response.ok) {
        // Fallback to gold forex if crypto fails
        const forexResponse = await fetch(
          `https://finnhub.io/api/v1/forex/candle?symbol=${symbol}&resolution=${timeframe}&from=${from}&to=${now}&token=${this.finnhubKey}`
        );
        
        if (!forexResponse.ok) throw new Error('Finnhub API failed');
        
        const forexData = await forexResponse.json();
        return this.analyzeVolumePatterns(forexData, timeframe);
      }
      
      const data = await response.json();
      return this.analyzeVolumePatterns(data, timeframe);
      
    } catch (error) {
      console.error('Volume analysis error:', error);
      return { volumeScore: 5, volumeData: { error: 'Volume data unavailable' } };
    }
  }

  private static analyzeVolumePatterns(data: any, timeframe: string): {volumeScore: number, volumeData: any} {
    if (!data || !data.v || data.v.length < 10) {
      return { volumeScore: 0, volumeData: { message: 'Insufficient volume data' } };
    }
    
    const volumes = data.v; // Volume array
    const closes = data.c; // Close prices array
    const recentVolumes = volumes.slice(-20);
    const avgVolume = recentVolumes.reduce((a: number, b: number) => a + b, 0) / recentVolumes.length;
    const currentVolume = volumes[volumes.length - 1] || 0;
    
    // Calculate volume indicators
    const volumeRatio = currentVolume / avgVolume;
    const volumeIncreasing = currentVolume > volumes[volumes.length - 2] * 1.5;
    const highVolumeAtExtreme = volumeRatio > 1.5 && 
                               (closes[closes.length - 1] === Math.max(...closes.slice(-5)) || 
                                closes[closes.length - 1] === Math.min(...closes.slice(-5)));
    
    let volumeScore = 0;
    
    // Volume confirmation rules
    if (volumeRatio > 2.0) volumeScore += 20; // Very high volume = strong move
    else if (volumeRatio > 1.5) volumeScore += 10;
    else if (volumeRatio < 0.5) volumeScore -= 10; // Low volume = weak move
    
    if (volumeIncreasing) volumeScore += 5;
    if (highVolumeAtExtreme) volumeScore += 15;
    
    // Volume divergence detection
    if (volumes.length >= 14) {
      const priceUp = closes[closes.length - 1] > closes[closes.length - 14];
      const volumeDown = currentVolume < volumes[volumes.length - 14];
      
      if (priceUp && volumeDown) volumeScore -= 15; // Bearish divergence
      if (!priceUp && !volumeDown) volumeScore += 15; // Bullish divergence
    }
    
    return {
      volumeScore: Math.max(-25, Math.min(25, volumeScore)),
      volumeData: {
        currentVolume,
        avgVolume,
        volumeRatio: volumeRatio.toFixed(2),
        volumeTrend: volumeIncreasing ? 'INCREASING' : 'DECREASING',
        timeframe
      }
    };
  }

  // 3. RISK MANAGEMENT (NEW)
  static checkRiskLimits(userId: string, tradeSize: number = 1): number {
    const userMetrics = this.riskMetrics.get(userId) || { dailyPnL: 0, tradesToday: 0 };
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Reset daily metrics if new day
    if (!this.riskMetrics.has(userId)) {
      this.riskMetrics.set(userId, { dailyPnL: 0, tradesToday: 0 });
    }
    
    // Risk rules
    let riskScore = 10; // Base score
    
    // Rule 1: Max daily loss protection (2%)
    if (userMetrics.dailyPnL < -2) {
      riskScore -= 30; // Block trading
    }
    
    // Rule 2: Max trades per day (50)
    if (userMetrics.tradesToday >= 50) {
      riskScore -= 25;
    }
    
    // Rule 3: Consecutive losses protection
    // (Track in real implementation)
    
    // Rule 4: Position size relative to account
    if (tradeSize > 5) { // Assuming 5% max position
      riskScore -= 15;
    }
    
    // Rule 5: Volatility-adjusted position sizing
    const currentVolatility = 0.015; // Get from market data
    if (currentVolatility > 0.025 && tradeSize > 2) {
      riskScore -= 20;
    }
    
    return Math.max(-50, Math.min(20, riskScore));
  }

  static updateRiskMetrics(userId: string, pnlChange: number, tradeExecuted: boolean = true): void {
    const current = this.riskMetrics.get(userId) || { dailyPnL: 0, tradesToday: 0 };
    
    this.riskMetrics.set(userId, {
      dailyPnL: current.dailyPnL + pnlChange,
      tradesToday: tradeExecuted ? current.tradesToday + 1 : current.tradesToday
    });
    
    // Store in database for persistence (add Firestore integration)
    // await db.collection('riskMetrics').doc(userId).set(metrics);
  }

  static getRiskDashboard(userId: string): any {
    const metrics = this.riskMetrics.get(userId) || { dailyPnL: 0, tradesToday: 0 };
    return {
      dailyPnL: metrics.dailyPnL.toFixed(2) + '%',
      tradesToday: metrics.tradesToday,
      riskLevel: metrics.dailyPnL < -1.5 ? 'HIGH' : metrics.dailyPnL < -0.5 ? 'MEDIUM' : 'LOW',
      canTrade: metrics.dailyPnL >= -2 && metrics.tradesToday < 50
    };
  }

  // 4. ENHANCED MARKET REGIME DETECTION
  static detectMarketRegime(prices: number[]): string {
    if (prices.length < 50) return 'RANGING';
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const currentPrice = prices[prices.length - 1];
    const volatility = this.calculateVolatility(prices);
    
    // Enhanced with ADX-like trend strength
    const trendStrength = this.calculateTrendStrength(prices);
    
    if (currentPrice > sma20 && sma20 > sma50 && volatility < 0.015 && trendStrength > 25) 
      return 'STRONG_UPTREND';
    if (currentPrice < sma20 && sma20 < sma50 && volatility < 0.015 && trendStrength > 25) 
      return 'STRONG_DOWNTREND';
    if (volatility > 0.025) return 'HIGH_VOLATILITY';
    if (trendStrength < 15) return 'CONSOLIDATION';
    return 'RANGING';
  }

  private static calculateTrendStrength(prices: number[]): number {
    if (prices.length < 14) return 0;
    let plusDM = 0;
    let minusDM = 0;
    
    for (let i = 1; i < 14; i++) {
      const upMove = prices[prices.length - i] - prices[prices.length - i - 1];
      const downMove = prices[prices.length - i - 1] - prices[prices.length - i];
      
      if (upMove > downMove && upMove > 0) plusDM += upMove;
      if (downMove > upMove && downMove > 0) minusDM += downMove;
    }
    
    const DIplus = (plusDM / 14) * 100;
    const DIminus = (minusDM / 14) * 100;
    const ADX = Math.abs(DIplus - DIminus) / (DIplus + DIminus) * 100;
    
    return isNaN(ADX) ? 0 : ADX;
  }

  // 5. ENHANCED CORRELATION ANALYSIS
  static async getCorrelationAnalysis(): Promise<number> {
    try {
      // Gold-USD inverse correlation
      const [goldResp, usdResp, spyResp] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/forex/candle?symbol=OANDA:XAU_USD&resolution=D&count=10&token=${this.finnhubKey}`),
        fetch(`https://finnhub.io/api/v1/forex/candle?symbol=OANDA:USD_CAD&resolution=D&count=10&token=${this.finnhubKey}`),
        fetch(`https://finnhub.io/api/v1/quote?symbol=SPY&token=${this.finnhubKey}`)
      ]);
      
      const goldData = await goldResp.json();
      const usdData = await usdResp.json();
      const spyData = await spyResp.json();
      
      if (!goldData.c || !usdData.c) return 0;
      
      const goldChange = ((goldData.c[goldData.c.length-1] - goldData.c[0]) / goldData.c[0]) * 100;
      const usdChange = ((usdData.c[usdData.c.length-1] - usdData.c[0]) / usdData.c[0]) * 100;
      const spyChange = ((spyData.c - spyData.pc) / spyData.pc) * 100;
      
      let correlationScore = 0;
      
      // USD strength inversely correlates with gold
      if (usdChange > 0.5 && goldChange < 0) correlationScore -= 15;
      if (usdChange < -0.5 && goldChange > 0) correlationScore += 15;
      
      // Risk-on/off environment (SPY correlation)
      if (spyChange < -1 && goldChange > 0) correlationScore += 10; // Gold as safe haven
      if (spyChange > 1 && goldChange < 0) correlationScore -= 10; // Risk-on, gold sells off
      
      return correlationScore;
    } catch {
      return 0;
    }
  }

  // 6. UPDATED MAIN ALGORITHM ORCHESTRATOR
  static async generateUltimateSignal(
    priceData: any, 
    marketData: any, 
    userId: string = 'default'
  ): Promise<any> {
    try {
      const currentPrice = priceData.currentPrice;
      const allPrices = priceData.prices || [];
      const highs = priceData.highs || [];
      const lows = priceData.lows || [];
      const volatility = this.calculateVolatility(allPrices);
      
      // Get new volume analysis
      const { volumeScore, volumeData } = await this.getVolumeAnalysis();
      
      // Get price action patterns
      const patternScore = this.detectCandlestickPatterns(allPrices, highs, lows);
      
      // Check risk limits
      const riskLimitScore = this.checkRiskLimits(userId);
      
      // Calculate all factors
      const factors = {
        volatilityScore: this.calculateVolatilityScore({volatility}),
        regimeScore: this.calculateRegimeScore({prices: allPrices}),
        timeframeScore: await this.getMultiTimeframeData(currentPrice),
        keyLevelsScore: this.calculateKeyLevelsScore({prices: allPrices, currentPrice}),
        volumeScore: volumeScore, // Updated with Finnhub data
        sentimentScore: await this.getMarketSentiment(),
        economicScore: this.checkEconomicEvents(),
        patternScore: patternScore, // New price action patterns
        riskScore: riskLimitScore, // Updated risk management
        correlationScore: await this.getCorrelationAnalysis() // Enhanced correlation
      };

      // Get Gemini AI analysis
      const aiAnalysis = await this.getGeminiAnalysis(
        {currentPrice, prices: allPrices}, 
        {
          trend: factors.regimeScore > 0 ? 'BULLISH' : 'BEARISH',
          volatility: volatility,
          regime: this.detectMarketRegime(allPrices),
          volume: volumeData,
          patterns: patternScore !== 0 ? (patternScore > 0 ? 'BULLISH' : 'BEARISH') : 'NEUTRAL'
        }
      );

      // Calculate total score (0-100)
      const totalScore = this.calculateTotalScore(factors, aiAnalysis);
      
      // Generate final signal
      const signal = this.generateFinalSignal(totalScore, currentPrice, priceData, aiAnalysis, factors);
      
      // Log risk metrics if trade is generated
      if (signal.action !== 'HOLD') {
        this.updateRiskMetrics(userId, 0, true);
      }
      
      return {
        success: true,
        signal: signal,
        analysis: {
          totalScore: totalScore.toFixed(1),
          factors: Object.fromEntries(
            Object.entries(factors).map(([k, v]) => [k, typeof v === 'number' ? v.toFixed(2) : v])
          ),
          aiAnalysis,
          confidence: signal.confidence,
          riskDashboard: this.getRiskDashboard(userId),
          volumeData: volumeData,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Ultimate algorithm error:', error);
      return { 
        success: false, 
        error: 'Algorithm processing failed',
        riskDashboard: this.getRiskDashboard(userId || 'default')
      };
    }
  }

  // UPDATED TOTAL SCORE CALCULATION WITH NEW WEIGHTS
  static calculateTotalScore(factors: any, aiAnalysis: any): number {
    const weights: {[key: string]: number} = {
      volatilityScore: 0.07, 
      regimeScore: 0.10, 
      timeframeScore: 0.08, 
      keyLevelsScore: 0.09,
      volumeScore: 0.12, // Increased weight for volume
      sentimentScore: 0.06, 
      economicScore: 0.07, 
      patternScore: 0.10, // New weight for price patterns
      riskScore: 0.11, // Increased weight for risk management
      correlationScore: 0.08, 
      aiConfidence: 0.12 // Slightly increased AI weight
    };

    let totalScore = 50;
    for (const [factor, weight] of Object.entries(weights)) {
      if (factor === 'aiConfidence') {
        totalScore += ((aiAnalysis.confidence - 50) / 50) * weight * 100;
      } else if (factors[factor] !== undefined) {
        if (factor === 'sentimentScore') {
          totalScore += ((factors[factor] - 50)) * weight;
        } else if (factor === 'volumeScore' || factor === 'patternScore' || factor === 'riskScore') {
          // New factors have different scaling
          totalScore += factors[factor] * weight * 3;
        } else {
          totalScore += factors[factor] * weight * 2;
        }
      }
    }
    
    // Apply risk penalty if risk score is too low
    if (factors.riskScore < -20) {
      totalScore -= 15;
    }
    
    return Math.max(0, Math.min(100, Math.round(totalScore * 10) / 10));
  }

  // UPDATED FINAL SIGNAL GENERATION
  static generateFinalSignal(
    totalScore: number, 
    currentPrice: number, 
    priceData: any, 
    aiAnalysis: any,
    factors: any
  ): any {
    const atr = this.calculateATR(
      priceData.highs || [], 
      priceData.lows || [], 
      priceData.closes || [], 
      14
    );
    
    // Enhanced decision logic with volume confirmation
    const volumeConfirmed = factors.volumeScore > 10;
    const patternConfirmed = Math.abs(factors.patternScore) > 10;
    const riskBlocked = factors.riskScore < -20;
    
    let baseAction = 'HOLD';
    
    if (riskBlocked) {
      return { 
        action: 'HOLD', 
        confidence: 0, 
        reason: 'Trading blocked - Risk limits exceeded',
        riskAlert: true
      };
    }
    
    if (totalScore > 65 && volumeConfirmed) baseAction = 'BUY';
    else if (totalScore < 35 && volumeConfirmed) baseAction = 'SELL';
    else if (totalScore > 75 && patternConfirmed) baseAction = 'BUY';
    else if (totalScore < 25 && patternConfirmed) baseAction = 'SELL';
    else if (totalScore > 60) baseAction = 'BUY';
    else if (totalScore < 40) baseAction = 'SELL';
    
    if (baseAction === 'HOLD') {
      return { 
        action: 'HOLD', 
        confidence: 0, 
        reason: 'Market conditions not optimal - Waiting for confirmation' 
      };
    }

    const isBuy = baseAction === 'BUY';
    const confidence = Math.min(95, Math.max(60, Math.abs(totalScore - 50) * 1.8));
    
    // Dynamic position sizing based on risk score
    const positionSizeMultiplier = 1 + (factors.riskScore / 100);
    
    // Use ATR for dynamic SL/TP with risk adjustment
    const stopLoss = isBuy 
      ? currentPrice - (atr * (1.5 / positionSizeMultiplier))
      : currentPrice + (atr * (1.5 / positionSizeMultiplier));
    
    const takeProfit1 = isBuy 
      ? currentPrice + (atr * (2 * positionSizeMultiplier))
      : currentPrice - (atr * (2 * positionSizeMultiplier));
    
    const takeProfit2 = isBuy 
      ? currentPrice + (atr * (4 * positionSizeMultiplier))
      : currentPrice - (atr * (4 * positionSizeMultiplier));

    return {
      action: baseAction,
      confidence: parseFloat(confidence.toFixed(1)),
      reason: `Score: ${totalScore}/100. Volume: ${volumeConfirmed ? 'CONFIRMED' : 'WEAK'}. Patterns: ${patternConfirmed ? 'STRONG' : 'NEUTRAL'}. AI: ${aiAnalysis.reason}`,
      entryPrice: currentPrice,
      takeProfit1: parseFloat(takeProfit1.toFixed(2)),
      takeProfit2: parseFloat(takeProfit2.toFixed(2)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      positionSize: `${(positionSizeMultiplier * 100).toFixed(0)}%`,
      riskLevel: factors.riskScore > 5 ? 'LOW' : factors.riskScore > -5 ? 'MEDIUM' : 'HIGH'
    };
  }

  // Keep existing helper methods (ATR, SMA, Volatility, etc.) unchanged
  static calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (highs.length < 2) return 0;
    let trueRanges = [];
    for (let i = 1; i < highs.length; i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i-1]);
      const tr3 = Math.abs(lows[i] - closes[i-1]);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    if (trueRanges.length === 0) return 0;
    const relevantTrueRanges = trueRanges.slice(-period);
    return relevantTrueRanges.reduce((a, b) => a + b, 0) / relevantTrueRanges.length;
  }

  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  static calculateVolatilityScore(priceData: {volatility: number}): number {
    const volatility = priceData.volatility || 0.01;
    if (volatility < 0.008) return 8;
    if (volatility < 0.015) return 15;
    if (volatility < 0.025) return 5;
    return -5;
  }

  static calculateRegimeScore(priceData: { prices: number[]}): number {
    const regime = this.detectMarketRegime(priceData.prices);
    const scores: {[key: string]: number} = { 
      'STRONG_UPTREND': 20, 
      'STRONG_DOWNTREND': -20, 
      'HIGH_VOLATILITY': -10, 
      'CONSOLIDATION': 2,
      'RANGING': 5 
    };
    return scores[regime] || 0;
  }

  static calculateKeyLevelsScore(priceData: {prices: number[], currentPrice: number}): number {
    const keyLevels = this.calculateKeyLevels(priceData.prices);
    const currentPrice = priceData.currentPrice;
    if (keyLevels.support === 0 && keyLevels.resistance === 0) return 0;
    const distanceToSupport = Math.abs(currentPrice - keyLevels.support) / currentPrice;
    const distanceToResistance = Math.abs(currentPrice - keyLevels.resistance) / currentPrice;
    
    if (distanceToSupport < 0.002) return 15;
    if (distanceToResistance < 0.002) return -15;
    return 0;
  }

  static async getMultiTimeframeData(currentPrice: number): Promise<number> {
    try {
      const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1mo&interval=1d');
      const data = await response.json();
      const dailyPrices = data.chart.result[0].indicators.quote[0].close;
      const dailyTrend = dailyPrices[dailyPrices.length-1] > dailyPrices[dailyPrices.length-2] ? 25 : -25;
      return dailyTrend;
    } catch {
      return 0;
    }
  }

  static calculateKeyLevels(prices: number[]): any {
    if (prices.length === 0) return { support: 0, resistance: 0, pivot: 0 };
    const recentPrices = prices.slice(-20);
    const minPrice = Math.min(...recentPrices);
    const maxPrice = Math.max(...recentPrices);
    return {
      support: minPrice * 0.998,
      resistance: maxPrice * 1.002,
      pivot: (minPrice + maxPrice + prices[prices.length-1]) / 3
    };
  }

  static async getMarketSentiment(): Promise<number> {
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      return parseInt(data.data[0].value);
    } catch {
      return 50;
    }
  }

  static checkEconomicEvents(): number {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();
    const isHighImpactTime = (day === 3 && hour >= 13 && hour <= 15) || (day === 5 && hour >= 7 && hour <= 10);
    return isHighImpactTime ? -20 : 10;
  }

  static patternValidation(currentPrice: number, prices: number[]): number {
    if (prices.length < 5) return 0;
    const recentTrend = prices[prices.length-1] > prices[prices.length-5] ? 1 : -1;
    const volatility = this.calculateVolatility(prices);
    if (volatility < 0.01 && recentTrend > 0) return 15;
    if (volatility < 0.01 && recentTrend < 0) return -15;
    return 0;
  }

  static calculateRiskScore(confidence: number, volatility: number): number {
    const baseScore = 10;
    const confidenceBonus = (confidence - 50) / 10;
    const volatilityPenalty = volatility > 0.02 ? -5 : 0;
    return baseScore + confidenceBonus + volatilityPenalty;
  }

  static async getGeminiAnalysis(priceData: any, marketData: any): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `As a gold trading expert, analyze this gold market data:
      Current Price: $${priceData.currentPrice}
      Trend: ${marketData.trend}
      Volatility: ${marketData.volatility}
      Market Regime: ${marketData.regime}
      Volume Status: ${marketData.volume?.volumeTrend || 'Unknown'}
      Price Patterns: ${marketData.patterns || 'Neutral'}
      
      Provide ONLY JSON response: {"action": "BUY" or "SELL" or "HOLD", "confidence": 1-100, "reason": "brief explanation under 50 words"}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{.*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { action: 'HOLD', confidence: 50, reason: 'AI analysis failed' };
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return { action: 'HOLD', confidence: 50, reason: 'AI service unavailable' };
    }
  }
}
