import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAIService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  private static model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

  // Analyze gold market with comprehensive AI analysis
  static async analyzeGoldMarket(marketData: any): Promise<any> {
    try {
      const prompt = `
      AS A SENIOR GOLD TRADING ANALYST, analyze this gold market situation:

      CURRENT MARKET DATA:
      - Gold Price: $${marketData.currentPrice}
      - Market Trend: ${marketData.trend}
      - Volatility: ${marketData.volatility}%
      - Support Level: $${marketData.support}
      - Resistance Level: $${marketData.resistance}
      - Market Sentiment: ${marketData.sentiment}/100
      - Timeframe: ${marketData.timeframe}
      
      TECHNICAL CONTEXT:
      ${marketData.technicalContext || 'No additional technical context provided'}

      RECENT PRICE ACTION:
      ${marketData.recentAction || 'No recent price action data'}

      RESPOND WITH ONLY THIS JSON FORMAT:
      {
        "action": "BUY" or "SELL" or "HOLD",
        "confidence": 1-100,
        "reason": "Brief professional explanation based on technical and fundamental analysis",
        "timeframe": "Expected duration for this signal",
        "riskLevel": "LOW" or "MEDIUM" or "HIGH",
        "keyLevels": {
          "immediateSupport": number,
          "immediateResistance": number,
          "target1": number,
          "target2": number,
          "stopLoss": number
        }
      }

      Be precise, professional, and base your analysis on proven trading principles.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Clean and parse the JSON response
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        return this.validateAIResponse(analysis, marketData);
      }

      throw new Error('Invalid JSON response from AI');

    } catch (error) {
      console.error('Gemini AI analysis error:', error);
      return this.getFallbackAnalysis(marketData);
    }
  }

  // Pattern recognition for advanced signal generation
  static async recognizeTradingPatterns(priceData: any): Promise<any> {
    try {
      const prompt = `
      IDENTIFY TRADING PATTERNS in this gold price data:

      PRICE DATA (last 20 periods):
      ${JSON.stringify(priceData.closes.slice(-20))}

      VOLATILITY: ${priceData.volatility}
      CURRENT TREND: ${priceData.trend}

      Analyze for common patterns: Head & Shoulders, Double Top/Bottom, Triangles, Flags, etc.

      RESPOND WITH JSON:
      {
        "pattern": "Pattern name if found",
        "patternStrength": 1-100,
        "reliability": "HIGH/MEDIUM/LOW",
        "direction": "BULLISH/BEARISH/NEUTRAL",
        "targetPrice": number,
        "invalidatedBelow": number,
        "completionTimeframe": "Expected completion timeframe"
      }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const cleanedText = text.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        pattern: "NO_PATTERN_DETECTED",
        patternStrength: 0,
        reliability: "LOW",
        direction: "NEUTRAL"
      };

    } catch (error) {
      console.error('Pattern recognition error:', error);
      return {
        pattern: "ANALYSIS_FAILED",
        patternStrength: 0,
        reliability: "LOW",
        direction: "NEUTRAL"
      };
    }
  }

  // Market sentiment and news analysis
  static async analyzeMarketSentiment(): Promise<any> {
    try {
      const prompt = `
      ANALYZE CURRENT GOLD MARKET SENTIMENT based on recent economic conditions:

      Consider:
      - USD strength trends
      - Inflation expectations
      - Geopolitical factors affecting gold
      - Central bank policies
      - Global economic outlook

      RESPOND WITH JSON:
      {
        "overallSentiment": "BULLISH/BEARISH/NEUTRAL",
        "sentimentScore": 1-100,
        "keyDrivers": ["driver1", "driver2", "driver3"],
        "riskFactors": ["risk1", "risk2"],
        "outlook": "Short-term outlook description"
      }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const cleanedText = text.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        overallSentiment: "NEUTRAL",
        sentimentScore: 50,
        keyDrivers: ["Insufficient data for analysis"],
        riskFactors: ["AI service limited"],
        outlook: "Neutral outlook due to limited data"
      };

    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.getFallbackSentiment();
    }
  }

  // Risk assessment for position sizing
  static async assessTradeRisk(marketConditions: any): Promise<any> {
    try {
      const prompt = `
      ASSESS TRADE RISK for gold trading:

      MARKET CONDITIONS:
      - Volatility: ${marketConditions.volatility}%
      - Trend Strength: ${marketConditions.trendStrength}
      - Economic Events: ${marketConditions.economicEvents ? 'YES' : 'NO'}
      - Market Hours: ${marketConditions.marketHours}

      PROVIDE RISK ASSESSMENT IN JSON:
      {
        "riskLevel": "LOW/MEDIUM/HIGH",
        "positionSize": "SMALL/MEDIUM/LARGE",
        "stopLossPct": recommended percentage,
        "maxDrawdown": expected maximum drawdown percentage,
        "riskReward": recommended risk-reward ratio,
        "warning": "Any specific warnings"
      }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const cleanedText = text.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        riskLevel: "MEDIUM",
        positionSize: "MEDIUM",
        stopLossPct: 2,
        maxDrawdown: 5,
        riskReward: 1.5,
        warning: "Standard risk parameters applied"
      };

    } catch (error) {
      console.error('Risk assessment error:', error);
      return this.getFallbackRiskAssessment();
    }
  }

  // Validate AI response structure
  private static validateAIResponse(analysis: any, marketData: any): any {
    // Ensure required fields exist
    const defaultResponse = {
      action: "HOLD",
      confidence: 50,
      reason: "Validation failed - using conservative approach",
      timeframe: "N/A",
      riskLevel: "MEDIUM",
      keyLevels: {
        immediateSupport: marketData.currentPrice * 0.99,
        immediateResistance: marketData.currentPrice * 1.01,
        target1: marketData.currentPrice * 1.015,
        target2: marketData.currentPrice * 1.03,
        stopLoss: marketData.currentPrice * 0.985
      }
    };

    if (!analysis.action || !analysis.confidence) {
      return defaultResponse;
    }

    // Validate action type
    if (!['BUY', 'SELL', 'HOLD'].includes(analysis.action)) {
      analysis.action = "HOLD";
    }

    // Validate confidence range
    analysis.confidence = Math.max(1, Math.min(100, analysis.confidence));

    // Ensure key levels exist
    if (!analysis.keyLevels) {
      analysis.keyLevels = defaultResponse.keyLevels;
    }

    return analysis;
  }

  // Fallback analysis when AI fails
  private static getFallbackAnalysis(marketData: any): any {
    return {
      action: "HOLD",
      confidence: 50,
      reason: "AI analysis unavailable - using fallback conservative approach",
      timeframe: "N/A",
      riskLevel: "MEDIUM",
      keyLevels: {
        immediateSupport: marketData.currentPrice * 0.99,
        immediateResistance: marketData.currentPrice * 1.01,
        target1: marketData.currentPrice * 1.015,
        target2: marketData.currentPrice * 1.03,
        stopLoss: marketData.currentPrice * 0.985
      }
    };
  }

  private static getFallbackSentiment(): any {
    return {
      overallSentiment: "NEUTRAL",
      sentimentScore: 50,
      keyDrivers: ["Market data limited", "Conservative approach"],
      riskFactors: ["Limited AI analysis"],
      outlook: "Neutral outlook until better data available"
    };
  }

  private static getFallbackRiskAssessment(): any {
    return {
      riskLevel: "MEDIUM",
      positionSize: "MEDIUM",
      stopLossPct: 2,
      maxDrawdown: 5,
      riskReward: 1.5,
      warning: "Standard risk parameters due to limited analysis"
    };
  }

  // Health check for AI service
  static async healthCheck(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Respond with "OK"');
      await result.response;
      return true;
    } catch (error) {
      console.error('Gemini AI health check failed:', error);
      return false;
    }
  }
}