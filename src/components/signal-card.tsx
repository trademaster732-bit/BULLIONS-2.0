
'use client';

import { useState } from 'react';
import type {Signal, SignalStrength} from '@/lib/types';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Info,
  Target,
  Thermometer,
  XCircle,
  Ratio,
  Ban,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import {cn} from '@/lib/utils';
import ExplanationDialog from './explanation-dialog';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface SignalCardProps {
  signal: Signal;
  onCancel?: (signalId: string) => void;
}

// Inline SVG for WhatsApp because it's not in lucide-react
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

// Inline SVG for Telegram because it's not in lucide-react
const TelegramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M22 2 11 13" />
    <path d="m22 2-7 20-4-9-9-4 20-7z" />
  </svg>
);

const strengthIcons: Record<SignalStrength, React.ElementType> = {
    STRONG: ShieldCheck,
    MODERATE: Zap,
    RISKY: ShieldAlert,
}
const strengthColors: Record<SignalStrength, string> = {
    STRONG: 'text-green-500',
    MODERATE: 'text-yellow-500',
    RISKY: 'text-red-500',
}


export default function SignalCard({signal, onCancel}: SignalCardProps) {
  const isBuy = signal.action === 'BUY';
  const isActive = signal.status === 'ACTIVE';
  const isWin = signal.resultType === 'WIN' || signal.resultType === 'PARTIAL';
  const isCancelled = signal.status === 'CANCELLED';
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const cardBorderColor = isActive
    ? 'border-l-primary'
    : isCancelled
    ? 'border-l-muted-foreground'
    : isWin
    ? 'border-l-green-500'
    : 'border-l-red-500';
  const cardBgColor = isActive
    ? 'bg-secondary/30'
    : isCancelled
    ? 'bg-muted/30'
    : isWin
    ? 'bg-green-500/10'
    : 'bg-red-500/10';

  const StrengthIcon = strengthIcons[signal.strength] || Info;

  const generateShareText = () => {
    const actionEmoji = isBuy ? '📈' : '📉';
    return `
🚀 *BULLIONS BOT Signal* 🚀

${actionEmoji} Action: *${signal.action}*
✨ Pair: *GOLD (XAU/USD)*
*---------------------------*
*Timeframe:* ${signal.timeframe}
*Entry Price:* ${signal.entryPrice.toFixed(2)}
*Take Profit 1:* ${signal.takeProfit1.toFixed(2)}
*Take Profit 2:* ${signal.takeProfit2.toFixed(2)}
*Stop Loss:* ${signal.stopLoss.toFixed(2)}
*---------------------------*
Powered by BULLIONS BOT
    `.trim();
  };

  const handleCopy = () => {
    const textToCopy = generateShareText();
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({ title: 'Signal Copied!', description: 'You can now paste the signal details.' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = (platform: 'whatsapp' | 'telegram') => {
    const text = generateShareText();
    const encodedText = encodeURIComponent(text);
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    } else {
      url = `https://t.me/share/url?url=BULLIONSBOT&text=${encodedText}`;
    }
    window.open(url, '_blank');
  };


  return (
    <Card className={cn('relative overflow-hidden transition-all duration-300 border-l-4', cardBorderColor, cardBgColor)}>
      {isActive && (
        <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
      )}
      <CardContent className="p-2 md:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isBuy ? 'default' : 'destructive'} className="text-xs w-16 justify-center font-bold">
                {isBuy ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {signal.action}
            </Badge>
            <Badge variant="outline" className={cn("text-xs capitalize", strengthColors[signal.strength])}>
              <StrengthIcon className="w-3 h-3 mr-1" />
              {signal.strength}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {signal.timeframe}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Ratio className="w-3 h-3 mr-1" />
              {signal.riskRewardRatio} R/R
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Thermometer className="w-3 h-3 mr-1" />
              {signal.confidence}% Conf.
            </Badge>
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <div>Created: {new Date(signal.createdAt).toLocaleString()}</div>
            {signal.hitAt && <div>Completed: {new Date(signal.hitAt).toLocaleString()}</div>}
            {signal.cancelledAt && <div>Cancelled: {new Date(signal.cancelledAt).toLocaleString()}</div>}
          </div>
        </div>

        {isActive ? (
          <LiveInfo signal={signal} />
        ) : (
          <CompletedInfo signal={signal} />
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm pt-2">
            <PricePoint label="Entry" value={signal.entryPrice} className="text-foreground" />
            <PricePoint label="TP1" value={signal.takeProfit1} className="text-green-500" highlight={signal.hitType === 'TP1' || signal.hitType === 'TP2'} />
            <PricePoint label="TP2" value={signal.takeProfit2} className="text-green-400" highlight={signal.hitType === 'TP2'} />
            <PricePoint label="Stop Loss" value={signal.stopLoss} className="text-red-500" highlight={signal.hitType === 'SL'} />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-2 gap-3">
            <p className="text-xs text-muted-foreground italic max-w-prose">
                <strong>Analysis:</strong> {signal.reason}
            </p>
            <div className='flex items-center gap-2 self-end md:self-center shrink-0'>
              <ExplanationDialog signal={signal} />
              {isActive && onCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className='h-8'>
                      <Ban className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="modal-content">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to cancel this signal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This signal will be permanently cancelled and moved to your history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Back</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onCancel(signal.id)}>
                        Yes, Cancel Signal
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
        </div>
        
        {isActive && (
          <div className="border-t border-border/50 pt-3 mt-3 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2"><Share2 className="w-4 h-4" /> Share Signal:</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="h-8">
                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">Copy</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')} className="h-8 bg-[#25D366]/10 border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366]">
                <WhatsAppIcon />
                 <span className="ml-2 hidden sm:inline">WhatsApp</span>
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleShare('telegram')} className="h-8 bg-[#0088cc]/10 border-[#0088cc]/50 text-[#0088cc] hover:bg-[#0088cc]/20 hover:text-[#0088cc]">
                <TelegramIcon />
                 <span className="ml-2 hidden sm:inline">Telegram</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LiveInfo({signal}: {signal: Signal}) {
    const isProfit = (signal.currentPL || 0) >= 0;
    return (
        <div className="p-3 bg-background/50 border border-border rounded-lg animate-pulse-slow">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary">Live P/L:</span>
                <span className={cn('text-sm font-bold', isProfit ? 'text-green-500' : 'text-red-500')}>
                    {isProfit ? '+' : ''}{(signal.currentPL || 0).toFixed(2)} USD
                </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>Current Price: ${(signal.currentPrice || 0).toFixed(2)}</span>
                <span className="text-primary font-bold animate-blink-live">● LIVE</span>
            </div>
        </div>
    );
}

function CompletedInfo({signal}: {signal: Signal}) {
    const isWin = signal.resultType === 'WIN' || signal.resultType === 'PARTIAL';
    const isCancelled = signal.status === 'CANCELLED';

    if (isCancelled) {
        return (
            <div className={cn("p-3 rounded-lg bg-muted/50 border border-muted-foreground/20")}>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                       <Ban className="w-4 h-4" />
                        Signal Cancelled
                    </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                    This signal was manually cancelled before completion.
                </div>
            </div>
        );
    }

    return (
        <div className={cn("p-3 rounded-lg", isWin ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20")}>
             <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                   {isWin ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    Final Result ({signal.hitType}):
                </span>
                <span className={cn('text-sm font-bold', isWin ? 'text-green-500' : 'text-red-500')}>
                    {isWin && signal.resultType !== 'PARTIAL' ? '+' : ''}{(signal.finalPL || 0).toFixed(2)} USD
                </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>Entry: ${typeof signal.entryPrice === 'number' ? signal.entryPrice.toFixed(2) : '--.--'}</span>
                <span>Hit Price: ${(signal.hitPrice || 0).toFixed(2)}</span>
            </div>
        </div>
    );
}

function PricePoint({label, value, className, highlight}: {label: string, value: number, className?: string, highlight?: boolean}) {
    return (
        <div className={cn('text-center md:text-left', highlight && 'bg-primary/10 rounded-md p-1')}>
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className={cn("font-semibold", className)}>
                {typeof value === 'number' ? `$${value.toFixed(2)}` : '--.--'}
            </div>
        </div>
    );
}
