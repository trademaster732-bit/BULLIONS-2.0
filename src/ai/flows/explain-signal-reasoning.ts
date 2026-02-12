'use server';
/**
 * @fileOverview An AI agent that explains the reasoning behind a trading signal.
 *
 * - explainSignalReasoning - A function that explains the signal reasoning.
 * - ExplainSignalReasoningInput - The input type for the explainSignalReasoning function.
 * - ExplainSignalReasoningOutput - The return type for the explainSignalReasoning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSignalReasoningInputSchema = z.object({
  action: z.enum(['BUY', 'SELL']).describe('The trading action (BUY or SELL).'),
  confidence: z.number().describe('The confidence level of the signal (0-100).'),
  reason: z.string().describe('The original analysis reason for the signal.'),
  timeframe: z.string().describe('The timeframe of the trading signal (e.g., 15m, 1h).'),
});
export type ExplainSignalReasoningInput = z.infer<typeof ExplainSignalReasoningInputSchema>;

const ExplainSignalReasoningOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the reasoning behind the trading signal.'),
});
export type ExplainSignalReasoningOutput = z.infer<typeof ExplainSignalReasoningOutputSchema>;

export async function explainSignalReasoning(input: ExplainSignalReasoningInput): Promise<ExplainSignalReasoningOutput> {
  return explainSignalReasoningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSignalReasoningPrompt',
  input: {schema: ExplainSignalReasoningInputSchema},
  output: {schema: ExplainSignalReasoningOutputSchema},
  prompt: `You are an expert trading analyst explaining the reasoning behind a trading signal to a user.\n\nGiven the following information about a trading signal, provide a detailed and easy-to-understand explanation of the reasoning behind it. Focus on why the signal was generated and what market conditions support this recommendation.\n\nTrading Action: {{{action}}}\nConfidence Level: {{{confidence}}}\nOriginal Analysis Reason: {{{reason}}}\nTimeframe: {{{timeframe}}}\n\nExplanation: `,
});

const explainSignalReasoningFlow = ai.defineFlow(
  {
    name: 'explainSignalReasoningFlow',
    inputSchema: ExplainSignalReasoningInputSchema,
    outputSchema: ExplainSignalReasoningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
