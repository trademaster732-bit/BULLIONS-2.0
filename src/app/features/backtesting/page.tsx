'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BacktestingPage() {
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [backtestResults, setBacktestResults] = useState<any>(null);

  const calculatePositionSize = () => {
    return (accountSize * riskPercent) / 100;
  };

  const runBacktest = () => {
    // Simulated backtest data
    const results = {
      totalTrades: 100,
      winningTrades: 72,
      losingTrades: 28,
      winRate: 72,
      totalProfit: 2450,
      maxDrawdown: -350,
      profitFactor: 2.8,
      monthlyData: [
        { month: 'Jan', profit: 320 },
        { month: 'Feb', profit: 450 },
        { month: 'Mar', profit: 290 },
        { month: 'Apr', profit: 510 },
        { month: 'May', profit: 380 },
        { month: 'Jun', profit: 420 },
      ]
    };
    setBacktestResults(results);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gold-600">Signal Backtesting</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accountSize">Account Size ($)</Label>
              <Input 
                id="accountSize"
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(Number(e.target.value))}
                placeholder="Enter account size"
              />
            </div>
            <div>
              <Label htmlFor="riskPercent">Risk Per Trade (%)</Label>
              <Input 
                id="riskPercent"
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                placeholder="Enter risk percentage"
                min="0.5"
                max="5"
                step="0.5"
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Recommended Position Size:</p>
              <p className="text-2xl font-bold text-green-600">
                ${calculatePositionSize().toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                Based on {riskPercent}% risk of ${accountSize}
              </p>
            </div>
            <Button onClick={runBacktest} className="w-full bg-gold-600 hover:bg-gold-700">
              Run Backtest Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Results Display */}
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
          </CardHeader>
          <CardContent>
            {backtestResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-green-600">{backtestResults.winRate}%</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Profit</p>
                    <p className="text-2xl font-bold text-blue-600">${backtestResults.totalProfit}</p>
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={backtestResults.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="profit" stroke="#D4AF37" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Run backtest to see historical performance</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
