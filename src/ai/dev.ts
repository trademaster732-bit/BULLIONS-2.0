import { config } from 'dotenv';
config();

import '@/ai/flows/generate-trading-signal.ts';
import '@/ai/flows/explain-signal-reasoning.ts';