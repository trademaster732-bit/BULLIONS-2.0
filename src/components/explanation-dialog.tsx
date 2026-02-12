
'use client';

import {useState} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Text} from 'lucide-react';
import type {Signal} from '@/lib/types';
import {explainSignalAction} from '@/app/actions';
import { Skeleton } from './ui/skeleton';

interface ExplanationDialogProps {
  signal: Signal;
}

export default function ExplanationDialog({signal}: ExplanationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = async () => {
    if (!explanation) {
      setIsLoading(true);
      try {
        const result = await explainSignalAction({
          action: signal.action,
          confidence: signal.confidence,
          reason: signal.reason,
          timeframe: signal.timeframe,
        });
        setExplanation(result);
      } catch (error) {
        console.error('Failed to get explanation', error);
        setExplanation('Could not load detailed explanation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const entryPriceDisplay = typeof signal.entryPrice === 'number' 
    ? signal.entryPrice.toFixed(2) 
    : '--.--';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={handleOpen}>
          <Text className="w-4 h-4 mr-1" />
          Explain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] glass-card">
        <DialogHeader>
          <DialogTitle className='font-serif text-2xl'>AI Signal Analysis</DialogTitle>
          <DialogDescription>
            A detailed breakdown of the "{signal.action} at ${entryPriceDisplay}" signal.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 text-sm">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{explanation}</p>
            )}
            <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-lg border bg-background/50 p-3">
                    <dt className="text-muted-foreground">Original Reason</dt>
                    <dd className="font-semibold">{signal.reason}</dd>
                </div>
                 <div className="rounded-lg border bg-background/50 p-3">
                    <dt className="text-muted-foreground">Confidence Score</dt>
                    <dd className="font-semibold">{signal.confidence}%</dd>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
