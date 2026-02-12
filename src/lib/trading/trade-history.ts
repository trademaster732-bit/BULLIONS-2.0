
'use client';
import { trackTradeOutcome } from './ultimate-trading-algorithm';


export class TradeHistory {
    static updateTradeHistory(trade: any, currentPrice: number) {
        const updatedTrade = trackTradeOutcome(trade, currentPrice);
        
        // Determine how to display in history
        let displayStatus = 'OPEN';
        let displayProfit = 0;
        
        if (updatedTrade.tp1Hit && updatedTrade.slHit) {
            // 🎯 CRITICAL FIX: Show as WIN (TP1 hit) even if SL hit later
            displayStatus = 'WIN (TP1 HIT)';
            const profitDistance = Math.abs(updatedTrade.takeProfit1 - updatedTrade.entryPrice);
            displayProfit = updatedTrade.action === 'BUY' ? profitDistance : profitDistance; // Profit is always positive in this case
        } else if (updatedTrade.tp1Hit && updatedTrade.tp2Hit) {
            displayStatus = 'WIN (TP2 HIT)';
            const profitDistance = Math.abs(updatedTrade.takeProfit2 - updatedTrade.entryPrice);
            displayProfit = updatedTrade.action === 'BUY' ? profitDistance : profitDistance;
        } else if (updatedTrade.tp1Hit && !updatedTrade.slHit) {
            displayStatus = 'WIN (TP1 HIT - RUNNING)';
            const profitDistance = Math.abs(updatedTrade.takeProfit1 - updatedTrade.entryPrice);
            displayProfit = updatedTrade.action === 'BUY' ? profitDistance : profitDistance;
        } else if (updatedTrade.slHit && !updatedTrade.tp1Hit) {
            displayStatus = 'LOSS';
            const lossDistance = Math.abs(updatedTrade.stopLoss - updatedTrade.entryPrice);
            displayProfit = updatedTrade.action === 'BUY' ? -lossDistance : -lossDistance;
        } else {
            displayStatus = 'OPEN';
            const currentProfit = updatedTrade.action === 'BUY' 
                ? currentPrice - updatedTrade.entryPrice 
                : updatedTrade.entryPrice - currentPrice;
            displayProfit = currentProfit;
        }
        
        return {
            ...updatedTrade,
            displayStatus,
            displayProfit: parseFloat(displayProfit.toFixed(2)),
            lastUpdated: new Date().toISOString()
        };
    }
    
    static getUserFeedbackOptions() {
        return [
            { value: 5, label: 'Excellent - Signal was perfect', emoji: '😊' },
            { value: 4, label: 'Good - Signal was accurate', emoji: '👍' },
            { value: 3, label: 'Average - Could be better', emoji: '😐' },
            { value: 2, label: 'Poor - Signal was off', emoji: '👎' },
            { value: 1, label: 'Very Poor - Completely wrong', emoji: '😞' }
        ];
    }
}

    