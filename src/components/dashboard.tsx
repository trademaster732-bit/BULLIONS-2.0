'use client';

import {useState, useEffect, useMemo, useCallback} from 'react';
import type {PriceData, Signal, User, TradingSignalInput} from '@/lib/types';
import {generateSignalAction} from '@/app/actions';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Activity, AlertTriangle, Clock, TrendingUp, Ratio, LogOut, ShieldCheck, ArrowRight, ShieldX, UserCog, CalendarClock} from 'lucide-react';
import SignalCard from '@/components/signal-card';
import {useToast} from '@/hooks/use-toast';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useRouter } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';


const TIMEERAMES = ['5m', '15m', '30m', '1h', '4h', '1d'];
const RR_RATIOS = ['1:1', '1:2', '1:3', '1:4'];
const MAX_ACTIVE_SIGNALS = 3;

function SubscriptionStatus({ user, onDowngrade }: { user: User, onDowngrade: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | 'Expired' | null>(null);

  useEffect(() => {
    if (user.role !== 'PREMIUM_USER' || !user.subscription?.endDate) {
      return;
    }

    const endDate = new Date(user.subscription.endDate);
    
    const calculateTimeLeft = () => {
        const now = new Date();
        const difference = endDate.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeLeft('Expired');
          onDowngrade();
          return;
        }

        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);

  }, [user.subscription?.endDate, user.role, onDowngrade]);

  if (user.role === 'ADMIN') {
    return (
      <Badge className="bg-amber-600/80 text-white border-amber-500 text-sm gap-2 cursor-pointer" onClick={() => (window.location.href = '/admin')}>
        <UserCog size={16} /> Admin Panel
      </Badge>
    );
  }

  if (user.role === 'PREMIUM_USER' && user.subscription?.endDate) {
    return (
      <div className='flex items-center flex-wrap gap-2 md:gap-4'>
        <Badge className="bg-primary/80 text-primary-foreground border-primary text-xs md:text-sm gap-2">
            <ShieldCheck size={16} /> Premium
        </Badge>
        {timeLeft && (
            <Badge variant="outline" className='gap-2 text-xs md:text-sm tabular-nums'>
                <CalendarClock size={16} />
                {timeLeft === 'Expired' 
                    ? 'Expired' 
                    : timeLeft && `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                }
            </Badge>
        )}
      </div>
    );
  }

  return (
    <Button size="sm" onClick={() => (window.location.href = '/upgrade')}>
        Upgrade to Premium <ArrowRight size={16} className='ml-2' />
    </Button>
  );
}


export default function Dashboard() {
  const {toast} = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedRR, setSelectedRR] = useState('1:2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  
  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: currentUser, isLoading: userIsLoading } = useDoc<User>(userDocRef);

  const handleDowngrade = useCallback(() => {
    if (currentUser?.role === 'PREMIUM_USER' && userDocRef) {
      toast({
        variant: 'destructive',
        title: 'Subscription Expired',
        description: 'Your premium access has ended. You have been downgraded to a free user.',
      });
      updateDocumentNonBlocking(userDocRef, { 
        role: 'FREE_USER',
        'subscription.status': 'INACTIVE'
      });
    }
  }, [currentUser, userDocRef, toast]);
  

  useEffect(() => {
    if (!userIsLoading && currentUser?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [userIsLoading, currentUser, router]);

  const signalsCollection = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'signals') : null),
    [firestore, user]
  );

  const signalsQuery = useMemoFirebase(
    () => (signalsCollection ? query(signalsCollection, orderBy('createdAt', 'desc')) : null),
    [signalsCollection]
  );
  
  const { data: signals, isLoading: signalsLoading } = useCollection<Signal>(signalsQuery);


  const fetchPrice = useCallback(async () => {
    try {
      const response = await fetch('/api/gold-price');
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'API key not configured') {
          setIsApiKeyMissing(true);
          setError('API key is missing.');
        } else if (response.status === 403) {
            setIsApiKeyMissing(true);
            setError('Invalid API key. Please check your .env file.');
        } else {
          throw new Error(`Failed to fetch price: ${response.statusText}`);
        }
        return;
      }
      const data = await response.json();
      
      setPriceData(prevData => {
        if (prevData && typeof prevData.price === 'number') {
            const newPrice = data.price;
            const change = newPrice - prevData.price;
            const changePercent = (change / prevData.price) * 100;
            return {
              price: newPrice,
              change: change,
              changePercent: changePercent,
              timestamp: data.timestamp,
            };
        }
        // First fetch or if previous data is invalid
        return {
          price: data.price,
          change: 0,
          changePercent: 0,
          timestamp: data.timestamp,
        }
      });
      setError(null);
      setIsApiKeyMissing(false);
    } catch (e: any) {
      console.error('Error fetching gold price:', e.message);
      if (!isApiKeyMissing) {
        setError('Could not fetch live price.');
      }
    }
  }, [isApiKeyMissing]);

  useEffect(() => {
    fetchPrice();
    const priceInterval = setInterval(fetchPrice, 5000); // Fetch every 5 seconds
    return () => clearInterval(priceInterval);
  }, [fetchPrice]);

  const monitorSignals = useCallback((currentPrice: number) => {
    if (!signals || !user || !firestore || !currentUser) return;
    
    // Signal monitoring is a premium feature
    if (currentUser.role !== 'PREMIUM_USER' && currentUser.role !== 'ADMIN') return;

    signals.forEach(signal => {
      if (signal.status !== 'ACTIVE') return;

      let hitResult: {
        hit: boolean;
        type: 'TP1' | 'TP2' | 'SL' | null;
        resultType: 'WIN' | 'LOSS' | null;
        hitPrice: number | null;
      } = {hit: false, type: null, resultType: null, hitPrice: null};

      if (signal.action === 'BUY') {
        if (currentPrice >= signal.takeProfit2) {
          hitResult = {hit: true, type: 'TP2', resultType: 'WIN', hitPrice: signal.takeProfit2};
        } else if (currentPrice >= signal.takeProfit1) {
          hitResult = {hit: true, type: 'TP1', resultType: 'WIN', hitPrice: signal.takeProfit1};
        } else if (currentPrice <= signal.stopLoss) {
          hitResult = {hit: true, type: 'SL', resultType: 'LOSS', hitPrice: signal.stopLoss};
        }
      } else { // SELL
        if (currentPrice <= signal.takeProfit2) {
          hitResult = {hit: true, type: 'TP2', resultType: 'WIN', hitPrice: signal.takeProfit2};
        } else if (currentPrice <= signal.takeProfit1) {
          hitResult = {hit: true, type: 'TP1', resultType: 'WIN', hitPrice: signal.takeProfit1};
        } else if (currentPrice >= signal.stopLoss) {
          hitResult = {hit: true, type: 'SL', resultType: 'LOSS', hitPrice: signal.stopLoss};
        }
      }
      
      const signalDocRef = doc(firestore, 'users', user.uid, 'signals', signal.id);

      if (hitResult.hit) {
        const finalPL = signal.action === 'BUY' 
          ? hitResult.hitPrice! - signal.entryPrice 
          : signal.entryPrice - hitResult.hitPrice!;

        updateDocumentNonBlocking(signalDocRef, {
          status: 'COMPLETED',
          hitAt: new Date().toISOString(),
          hitPrice: hitResult.hitPrice!,
          hitType: hitResult.type!,
          resultType: hitResult.resultType!,
          finalPL: finalPL
        });
      } else {
        const currentPL = signal.action === 'BUY'
          ? currentPrice - signal.entryPrice
          : signal.entryPrice - currentPrice;
        
        updateDocumentNonBlocking(signalDocRef, {
          currentPrice: currentPrice,
          currentPL: currentPL
        });
      }
    });
  }, [signals, firestore, user, currentUser]);


  useEffect(() => {
    if (priceData) {
      monitorSignals(priceData.price);
    }
  }, [priceData, monitorSignals]);

  const {activeSignals, completedSignals} = useMemo(() => {
    if (!signals) return { activeSignals: [], completedSignals: [] };
    const active = signals.filter(s => s.status === 'ACTIVE');
    const completed = signals.filter(s => s.status !== 'ACTIVE');
    return {activeSignals: active, completedSignals: completed};
  }, [signals]);
  
  const handleGenerateSignal = async () => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to generate a signal." });
        return;
    }
     if (currentUser && currentUser.role !== 'PREMIUM_USER' && currentUser.role !== 'ADMIN') {
      router.push('/upgrade');
      return;
    }
    if (isApiKeyMissing) {
        toast({
            variant: 'destructive',
            title: 'API Key Required',
            description: 'Please add your Gold API key to the .env file to generate signals.',
        });
        return;
    }
    if (!priceData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Live price data is not available. Cannot generate signal.',
      });
      return;
    }
    if (activeSignals.length >= MAX_ACTIVE_SIGNALS) {
        toast({
            variant: 'destructive',
            title: 'Signal Limit Reached',
            description: `You can only have ${MAX_ACTIVE_SIGNALS} active signals at a time.`,
        });
        return;
    }
    if (activeSignals.some(s => s.timeframe === selectedTimeframe)) {
        toast({
            variant: 'destructive',
            title: 'Duplicate Timeframe',
            description: `An active signal for the ${selectedTimeframe} timeframe already exists.`,
        });
        return;
    }

    setIsGenerating(true);
    try {
      const newSignal = await generateSignalAction({
        timeframe: selectedTimeframe,
        currentPrice: priceData.price,
        riskRewardRatio: selectedRR,
        prices: [], // Populated in server action
      }, user.uid);
      
      if (signalsCollection) {
        // Firestore will generate the ID, so we create a ref with .doc() and then set it.
        const newSignalRef = doc(signalsCollection);
        const signalWithId = { ...newSignal, id: newSignalRef.id };
        addDocumentNonBlocking(newSignalRef, signalWithId);
      }

      toast({
        title: 'Signal Generated!',
        description: `${newSignal.action} signal for ${newSignal.timeframe} at $${newSignal.entryPrice.toFixed(2)} created.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate a new trading signal. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelSignal = (signalId: string) => {
    if (!user) return;
    const signalDocRef = doc(firestore, 'users', user.uid, 'signals', signalId);
    updateDocumentNonBlocking(signalDocRef, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString()
    });
    toast({
        title: 'Signal Cancelled',
        description: 'The active signal has been cancelled.'
    });
  }

  const availableSlots = MAX_ACTIVE_SIGNALS - activeSignals.length;
  
  if (userIsLoading || !currentUser || currentUser.role === 'ADMIN') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Activity className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="relative z-10 p-2 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className='relative flex items-center justify-center md:justify-between w-full md:w-auto'>
                <Image src="/logo-new.png" alt="Gold Trading Bot Logo" width={200} height={50} className="h-auto" />
                <Button variant="ghost" size="icon" onClick={() => auth.signOut()} className="absolute right-0 top-1/2 -translate-y-1/2 md:hidden">
                    <LogOut className="h-5 w-5" />
                    <span className='sr-only'>Log Out</span>
                </Button>
            </div>
            <div className='flex flex-col md:flex-row items-center gap-2 md:gap-4'>
                {userIsLoading ? (
                <Skeleton className='h-8 w-48 rounded-md' />
                ) : (
                    <SubscriptionStatus user={currentUser} onDowngrade={handleDowngrade} />
                )}
                <Button variant="ghost" size="icon" onClick={() => auth.signOut()} className="hidden md:flex">
                    <LogOut className="h-5 w-5" />
                    <span className='sr-only'>Log Out</span>
                </Button>
          </div>
        </header>

        {isApiKeyMissing && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required: API Key Issue</AlertTitle>
            <AlertDescription>
              {error === 'Invalid API key. Please check your .env file.' 
                ? 'The provided API key is invalid. Please verify your key in the .env file.'
                : 'Please add your free API key from gold-api.com to the .env file (e.g., GOLD_API_KEY=your_key) to enable live price fetching.'
              }
            </AlertDescription>
          </Alert>
        )}

        <Card className="glass-card relative overflow-hidden shadow-2xl shadow-primary/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-pulse"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-xl md:text-2xl">
              <Activity className="h-6 w-6 text-primary" />
              Live Gold Price (XAU/USD)
              <Badge variant="outline" className="text-xs border-primary/50 text-primary animate-pulse">
                LIVE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {priceData ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                    ${priceData.price.toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium ${priceData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceData.change >= 0 ? '▲' : '▼'} {Math.abs(priceData.change).toFixed(2)} (
                    {priceData.changePercent.toFixed(2)}%)
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center sm:text-right">
                  <div>Last updated: {new Date(priceData.timestamp).toLocaleTimeString()}</div>
                  {error && !isApiKeyMissing && <div className="text-red-500 font-semibold">{error}</div>}
                </div>
              </div>
            ) : (
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-48" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="glass-card lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-serif text-xl md:text-2xl">
                <div className='flex items-center gap-2'>
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Signal Generator
                </div>
                <Badge variant={availableSlots > 0 ? 'secondary' : 'destructive'}>
                    {availableSlots} Slot{availableSlots !== 1 && 's'} Free
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Generate signals using AI analysis. Max {MAX_ACTIVE_SIGNALS} active signals.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Timeframe</label>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                  {TIMEERAMES.map((tf) => (
                    <Button
                      key={tf}
                      variant={selectedTimeframe === tf ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe(tf)}
                      disabled={activeSignals.some(s => s.timeframe === tf)}
                      className="text-xs md:text-sm flex-grow md:flex-grow-0"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Risk/Reward Ratio</label>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                  {RR_RATIOS.map((rr) => (
                    <Button
                      key={rr}
                      variant={selectedRR === rr ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRR(rr)}
                      className="text-xs md:text-sm flex-grow md:flex-grow-0"
                    >
                      <Ratio className="h-4 w-4 mr-1" />
                      {rr}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerateSignal}
                className="w-full"
                disabled={isGenerating || !priceData || isApiKeyMissing || !user || availableSlots <= 0 || activeSignals.some(s => s.timeframe === selectedTimeframe)}
                size="lg"
              >
                {isGenerating ? 'Generating...' : 'Generate AI Signal'}
              </Button>
              {priceData && !isApiKeyMissing && (
                <div className="text-xs text-muted-foreground text-center">
                  Will generate based on live price of ${priceData.price.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl md:text-2xl">
                <Activity className="h-6 w-6 text-primary animate-pulse-slow" />
                Live Signal Monitor
                <Badge variant="secondary">{activeSignals.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {signalsLoading ? (
                 <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p className="font-semibold mb-1">Loading Signals...</p>
                </div>
              ) : currentUser && currentUser.role === 'FREE_USER' ? (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                  <ShieldX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold mb-1">Premium Feature</p>
                  <p className="text-sm max-w-sm mb-4">Live signal monitoring and P/L tracking is only available for premium users.</p>
                  <Button onClick={() => router.push('/upgrade')}>
                    Upgrade to Premium Now <ArrowRight size={16} className='ml-2' />
                  </Button>
                </div>
              ) : activeSignals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-semibold mb-1">No Active Signals</p>
                  <p className="text-sm">Generate a new signal to begin monitoring. You have {availableSlots} available slots.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto custom-scrollbar pr-2">
                  {activeSignals.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} onCancel={handleCancelSignal} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl md:text-2xl">
                    <Clock className="h-6 w-6 text-primary" />
                    Signal History
                    <Badge variant="secondary">{completedSignals.length} Completed</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {signalsLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                    <p className="font-semibold mb-1">Loading History...</p>
                  </div>
                ) : completedSignals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold mb-1">No Completed Signals</p>
                    <p className="text-sm">Signal history will appear here once they complete or are cancelled.</p>
                </div>
                ) : (
                <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {completedSignals.map((signal) => (
                        <SignalCard key={signal.id} signal={signal} />
                    ))}
                </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
