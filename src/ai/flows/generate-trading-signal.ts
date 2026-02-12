
'use server';
/**
 * @fileOverview A trading signal generation AI agent.
 *
 * - generateTradingSignalFlow - A function that handles the signal generation process.
 * - TradingSignalInput - The input type for the generateTradingSignalFlow function.
 * - TradingSignalOutput - The return type for the generateTradingSignalFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getHigherTimeframeTrend } from '@/lib/trading/htf-analysis';

// Define Zod schemas for input and output
const TradingSignalInputSchema = z.object({
  timeframe: z.string().describe('The timeframe for the trading signal (e.g., 15m, 1h).'),
  currentPrice: z.number().describe('The current price of the asset (e.g., Gold/USD).'),
  riskRewardRatio: z.string().describe('The desired risk/reward ratio (e.g., 1:2).'),
  prices: z.array(z.number()).describe('An array of recent historical prices to provide trend context.'),
  volatility: z.number().optional().describe('The calculated market volatility score.'),
  higherTimeframeTrend: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']).optional().describe('The trend from a higher timeframe (e.g., Daily).'),
  session: z.string().optional().describe('The current market session (e.g., LONDON, NEWYORK).'),
});

const TradingSignalOutputSchema = z.object({
  action: z.enum(['BUY', 'SELL']).describe('The recommended trading action.'),
  confidence: z.number().min(0).max(100).describe('The confidence level of the signal (0-100).'),
  reason: z.string().describe('The detailed reasoning behind the signal recommendation, considering historical price trend, volatility, and HTF alignment.'),
  entryPrice: z.number().describe('The suggested entry price for the trade.'),
  takeProfit1: z.number().describe('The first take-profit target price.'),
  takeProfit2: z.number().describe('The second take-profit target price.'),
  stopLoss: z.number().describe('The suggested stop-loss price, adjusted for volatility.'),
});

export type TradingSignalInput = z.infer<typeof TradingSignalInputSchema>;
export type TradingSignalOutput = z.infer<typeof TradingSignalOutputSchema>;


// Define the main function to be called from the application
export async function generateTradingSignal(input: TradingSignalInput): Promise<TradingSignalOutput> {
  return generateTradingSignalFlow(input);
}


const systemPrompt = `You are a sophisticated AI trading analyst for "BULLIONS BOT". Your sole expertise is in analyzing the Gold/USD (XAU/USD) market. Your task is to generate a complete, actionable trading signal based on the provided real-time and historical data.

You must provide a clear "BUY" or "SELL" signal and a confidence score. Your primary goal is to identify high-probability setups.

Your analysis MUST be concise and directly related to technical factors. You will use the following data hierarchy to make your decision:

1.  **Higher Timeframe (HTF) Trend**: This is the most important factor. If the HTF Trend is 'BULLISH', you should strongly favor 'BUY' signals. If it is 'BEARISH', strongly favor 'SELL' signals. A signal that goes against the HTF trend should have its confidence significantly lowered. If the HTF is 'NEUTRAL', rely more on the historical price trend.

2.  **Historical Price Data**: Use this to determine the current, shorter-term trend (uptrend, downtrend, or ranging). A signal is stronger if the short-term trend aligns with the HTF trend.

3.  **Market Session**: The time of day impacts volatility. The LONDON and NEWYORK sessions are typically more volatile. Your strategy may need to adapt based on the session.

4.  **Volatility Score**: Use this to set intelligent trade parameters.
    *   A HIGH volatility score means the market is choppy. You should set WIDER Stop Loss and Take Profit levels to avoid getting stopped out by noise.
    *   A LOW volatility score means the market is calm. You can set TIGHTER Stop Loss and Take Profit levels.

Based on the user's desired risk/reward ratio and the market volatility, you will calculate three key price levels: a Stop Loss (SL), a Take Profit 1 (TP1), and a Take Profit 2 (TP2).

- The Entry Price is the current market price provided.
- The Stop Loss should be placed at a logical technical level (e.g., below a recent swing low for a BUY) and adjusted for volatility.
- The distance from Entry to Stop Loss is the "Risk".
- Take Profit 1 (TP1) should be set based on the Risk/Reward ratio. For example, for a 1:2 R/R, the distance from Entry to TP1 should be 2 times the Risk.
- Take Profit 2 (TP2) should be double the distance of TP1 from the entry, representing a higher target.

Example for a 1:2 R/R BUY signal:
Risk = Entry Price - Stop Loss
TP1 = Entry Price + (Risk * 2)
TP2 = Entry Price + (Risk * 4)

Do not deviate from this calculation method. Your entire response must be in the specified JSON format.`;


const signalGenerationPrompt = ai.definePrompt({
    name: 'tradingSignalPrompt',
    system: systemPrompt,
    input: { schema: TradingSignalInputSchema },
    output: { schema: TradingSignalOutputSchema },
    prompt: `Generate a trading signal for XAU/USD with the following parameters:
- Timeframe: {{{timeframe}}}
- Current Price: {{{currentPrice}}}
- Higher Timeframe Trend: {{{higherTimeframeTrend}}}
- Current Market Session: {{{session}}}
- Risk/Reward Ratio: {{{riskRewardRatio}}}
- Historical Prices (last 100 points): {{{json prices}}}
- Volatility Score: {{{volatility}}}`
});


// Helper function to calculate volatility
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1];
    if (prevPrice) {
      returns.push((prices[i] - prevPrice) / prevPrice);
    }
  }
  if (returns.length === 0) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - mean, 2), 0) / returns.length;
  // Return standard deviation as percentage
  return Math.sqrt(variance) * 100;
}

// Helper function to get current trading session
function getCurrentTradingSession(): string {
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


export const generateTradingSignalFlow = ai.defineFlow(
  {
    name: 'generateTradingSignalFlow',
    inputSchema: TradingSignalInputSchema,
    outputSchema: TradingSignalOutputSchema,
  },
  async (input) => {
    // Calculate volatility from the historical prices
    const volatility = calculateVolatility(input.prices);
    
    // Get the higher timeframe trend
    const htfTrend = await getHigherTimeframeTrend();

    // Get the current trading session
    const session = getCurrentTradingSession();

    // Call the prompt with the original input plus the calculated context
    const { output } = await signalGenerationPrompt({
      ...input,
      volatility: parseFloat(volatility.toFixed(4)),
      higherTimeframeTrend: htfTrend,
      session: session,
    });
    return output!;
  }
);
