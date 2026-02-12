
export interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  prices?: number[];
}

export type SignalAction = 'BUY' | 'SELL';
export type SignalStrength = 'STRONG' | 'MODERATE' | 'RISKY';

export interface Signal {
  id: string;
  userId: string;
  action: SignalAction;
  entryPrice: number;
  takeProfit1: number;
  takeProfit2: number;
  stopLoss: number;
  timeframe: string;
  riskRewardRatio: string;
  confidence: number;
  strength: SignalStrength;
  reason: string;
  createdAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  resultType?: 'WIN' | 'LOSS' | 'PARTIAL';
  hitPrice?: number;
  hitAt?: string;
  cancelledAt?: string;
  hitType?: 'TP1' | 'TP2' | 'SL';
  finalPL?: number;
  // For live monitoring
  currentPrice?: number;
  currentPL?: number;
  // For analysis and learning
  analysis?: any; 
}

export type UserRole = 'FREE_USER' | 'PREMIUM_USER' | 'ADMIN';

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE';

export interface Subscription {
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  renewsOn: string;
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  createdAt: string;
  subscription?: {
    planId: string;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    renewsOn: string;
  };
}

export interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  amount: number;
  transactionId: string;
  paymentProofUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    description: string;
}

export interface TradingSignalInput {
  timeframe: string;
  currentPrice: number;
  riskRewardRatio: string;
  prices: number[];
  volatility?: number;
  higherTimeframeTrend?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  session?: string;
}
