
'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getHigherTimeframeTrend } from '@/lib/trading/htf-analysis';
import { getCurrentTradingSession } from '@/lib/trading/ultimate-trading-algorithm';

const TradingSignalInputSchema = z.object({
  timeframe: z.string(),
  currentPrice: z.number(),
  riskRewardRatio: z.string(),
  prices: z.array(z.number()),
  volatility: z.number().optional(),
  higherTimeframeTrend: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']).optional(),
  session: z.string().optional(),
});

const TradingSignalOutputSchema = z.object({
  action: z.enum(['BUY', 'SELL']),
  confidence: z.number().min(0).max(100),
  reason: z.string(),
  entryPrice: z.number(),
  takeProfit1: z.number(),
  takeProfit2: z.number(),
  stopLoss: z.number(),
});

export type TradingSignalInput = z.infer<typeof TradingSignalInputSchema>;
export type TradingSignalOutput = z.infer<typeof TradingSignalOutputSchema>;

export async function generateTradingSignal(input: TradingSignalInput): Promise<TradingSignalOutput> {
  return generateTradingSignalFlow(input);
}

const systemPrompt = `You are a Gold (XAU/USD) trading expert. Generate high-probability signals based on:
1. HTF Trend: Align with Daily trend.
2. Session: Adapt to London/NY volatility.
3. Volatility: Adjust SL/TP distances.
4. Risk/Reward: Target 1:2 or better.
Provide concise technical reasoning.`;

const signalGenerationPrompt = ai.definePrompt({
    name: 'tradingSignalPrompt',
    system: systemPrompt,
    input: { schema: TradingSignalInputSchema },
    output: { schema: TradingSignalOutputSchema },
    prompt: `Generate XAU/USD signal:
- Timeframe: {{{timeframe}}}
- Price: {{{currentPrice}}}
- HTF: {{{higherTimeframeTrend}}}
- Session: {{{session}}}
- Prices: {{{json prices}}}`
});

export const generateTradingSignalFlow = ai.defineFlow(
  {
    name: 'generateTradingSignalFlow',
    inputSchema: TradingSignalInputSchema,
    outputSchema: TradingSignalOutputSchema,
  },
  async (input) => {
    const htfTrend = await getHigherTimeframeTrend();
    const session = await getCurrentTradingSession();
    const { output } = await signalGenerationPrompt({
      ...input,
      higherTimeframeTrend: htfTrend,
      session: session,
    });
    return output!;
  }
);
