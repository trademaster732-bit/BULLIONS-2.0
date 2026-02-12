'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNowStrict, isPast } from 'date-fns';
import { Badge } from './ui/badge';
import { CalendarClock, AlertCircle } from 'lucide-react';

interface SubscriptionCountdownProps {
  endDate: string;
}

export default function SubscriptionCountdown({ endDate }: SubscriptionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const targetDate = new Date(endDate);

    if (isPast(targetDate)) {
      setTimeLeft('Expired');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      if (isPast(targetDate)) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const distance = formatDistanceToNowStrict(targetDate, { addSuffix: false });
        setTimeLeft(distance);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) {
    return null;
  }
  
  const isExpired = timeLeft === 'Expired';
  const daysLeftMatch = timeLeft.match(/(\d+)\s+days?/);
  const daysLeft = daysLeftMatch ? parseInt(daysLeftMatch[1], 10) : null;
  const isEndingSoon = daysLeft !== null && daysLeft <= 7;

  return (
    <Badge 
      variant="outline" 
      className={`gap-2 text-sm ${isExpired ? 'text-red-500 border-red-500/50' : ''} ${isEndingSoon ? 'text-amber-500 border-amber-500/50' : ''}`}
    >
      {isExpired || isEndingSoon ? <AlertCircle size={16} /> : <CalendarClock size={16} />}
      {timeLeft}
    </Badge>
  );
}
