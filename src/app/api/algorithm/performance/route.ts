
import { NextRequest, NextResponse } from 'next/server';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase'; // Assumes db is exported from your firebase setup
import type { Signal } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // This should be protected in a real app (e.g., require admin role)
    
    const signalsQuery = query(
      collectionGroup(db, 'signals'), 
      where('status', '==', 'COMPLETED')
    );

    const querySnapshot = await getDocs(signalsQuery);
    const completedSignals = querySnapshot.docs.map(doc => doc.data() as Signal);

    if (completedSignals.length === 0) {
      return NextResponse.json({
        message: "No completed signals found to generate a performance report.",
        report: null,
      }, { status: 200 });
    }

    let winningTrades = 0;
    let losingTrades = 0;
    let partialWins = 0;
    let totalRiskReward = 0;
    let totalPL = 0;
    
    completedSignals.forEach(signal => {
      if (signal.resultType === 'WIN') {
        winningTrades++;
      } else if (signal.resultType === 'LOSS') {
        losingTrades++;
      } else if (signal.resultType === 'PARTIAL') {
        partialWins++;
      }

      if (signal.finalPL) {
        totalPL += signal.finalPL;
      }
      
      const rr = parseFloat(signal.riskRewardRatio);
      if (!isNaN(rr)) {
        totalRiskReward += rr;
      }
    });

    const totalTrades = completedSignals.length;
    const winRate = totalTrades > 0 ? (winningTrades / (totalTrades - partialWins)) * 100 : 0;
    const lossRate = totalTrades > 0 ? (losingTrades / (totalTrades - partialWins)) * 100 : 0;
    const partialWinRate = totalTrades > 0 ? (partialWins / totalTrades) * 100 : 0;
    const averageRiskReward = totalTrades > 0 ? totalRiskReward / totalTrades : 0;

    const report = {
      totalCompletedSignals: totalTrades,
      reportGeneratedAt: new Date().toISOString(),
      metrics: {
        winningTrades,
        losingTrades,
        partialWins,
        winRate: parseFloat(winRate.toFixed(2)),
        lossRate: parseFloat(lossRate.toFixed(2)),
        partialWinRate: parseFloat(partialWinRate.toFixed(2)),
        averageRiskReward: parseFloat(averageRiskReward.toFixed(2)),
        totalPL: parseFloat(totalPL.toFixed(2)),
      },
      outcomes: {
        tp2Hits: completedSignals.filter(s => s.hitType === 'TP2').length,
        tp1Hits: completedSignals.filter(s => s.hitType === 'TP1').length,
        slHits: completedSignals.filter(s => s.hitType === 'SL').length,
      }
    };

    // In a real app, you would save this report to a `/performance_reports` collection.
    
    return NextResponse.json({
      message: "Performance report generated successfully.",
      report,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to generate performance report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate performance report', details: error.message },
      { status: 500 }
    );
  }
}
