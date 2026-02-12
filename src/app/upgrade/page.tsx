
'use client';
import { useState, useTransition, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Sparkles, Trophy, Upload, Copy, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { Payment, Plan, User } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';

const availablePlans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 99,
    interval: 'month',
    description: 'Billed monthly'
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 299,
    interval: 'year',
    description: 'Billed annually'
  }
]

export default function UpgradePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedPlanId, setSelectedPlanId] = useState('monthly');
  const [transactionId, setTransactionId] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isCopied, setIsCopied] = useState(false);

  const walletAddress = '0xcdfd54ae1e00c0c402c08a65d10821329dafcf73';

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: currentUser, isLoading: isCurrentUserLoading } = useDoc<User>(userDocRef);

  const selectedPlan = useMemo(() => {
    return availablePlans.find(p => p.id === selectedPlanId);
  }, [selectedPlanId]);
  
  useEffect(() => {
    if (!isUserLoading && !isCurrentUserLoading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, currentUser, isCurrentUserLoading, router]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProofFile(file);
    }
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to submit a payment.',
      });
      return;
    }
    if (!transactionId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Transaction ID Required',
        description: 'Please enter the transaction hash.',
      });
      return;
    }
    if (!paymentProofFile) {
        toast({
            variant: 'destructive',
            title: 'Payment Proof Required',
            description: 'Please upload a screenshot of your transaction.',
        });
        return;
    }
    if (!selectedPlan) {
      toast({
        variant: 'destructive',
        title: 'Plan Not Selected',
        description: 'Please select a subscription plan.',
      });
      return;
    }

    startSubmitting(async () => {
      try {
        const paymentProofUrl = await fileToDataUrl(paymentProofFile);

        const paymentsCollection = collection(firestore, 'payments');
        const newPaymentRef = doc(paymentsCollection);

        const newPayment: Payment = {
          id: newPaymentRef.id,
          userId: user.uid,
          userEmail: user.email || 'N/A',
          planId: selectedPlan.id,
          amount: selectedPlan.price,
          transactionId: transactionId.trim(),
          paymentProofUrl: paymentProofUrl,
          status: 'PENDING',
          submittedAt: new Date().toISOString(),
        };

        await addDocumentNonBlocking(newPaymentRef, newPayment);

        toast({
          title: 'Submission Successful',
          description: "Your payment is being verified. We'll notify you upon approval.",
        });
        router.push('/dashboard');
      } catch (error) {
        console.error('Payment submission error:', error);
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: 'Could not submit your payment. Please try again.',
        });
      }
    });
  };

  if (currentUser && currentUser.role === 'PREMIUM_USER') {
      return (
         <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]"></div>
            <Button
                variant="ghost"
                className="absolute top-4 left-4 z-20"
                onClick={() => router.push('/dashboard')}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <div className="relative z-10 w-full max-w-md text-center">
                <Card className="glass-card shadow-2xl shadow-primary/10">
                    <CardHeader>
                        <CardTitle className="font-serif text-2xl md:text-3xl flex items-center justify-center gap-2"><Trophy className='text-primary' /> You're a Premium Member!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You already have full access to BULLIONS BOT features. Head back to the dashboard to continue trading.</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
      )
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]"></div>
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-20"
        onClick={() => router.push('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground drop-shadow-lg flex items-center gap-3">
             <Sparkles className="w-10 h-10 text-primary" />
            Upgrade to Premium
          </h1>
          <p className="text-muted-foreground text-lg">
            Unlock the full power of BULLIONS BOT with unlimited signals, live monitoring, and advanced analytics.
          </p>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-xl'><Trophy /> Premium Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FeatureItem>Unlimited AI Signal Generation</FeatureItem>
              <FeatureItem>Real-time Signal Monitoring & P/L</FeatureItem>
              <FeatureItem>Complete Trade History & Analytics</FeatureItem>
              <FeatureItem>Priority Support</FeatureItem>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card shadow-2xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Secure Your Access</CardTitle>
            <CardDescription>
              Choose your plan, complete the crypto payment, and upload proof.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId} className="grid grid-cols-2 gap-4">
                {availablePlans.map((plan) => (
                     <Label
                        key={plan.id}
                        htmlFor={plan.id}
                        className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                        selectedPlanId === plan.id && "border-primary"
                        )}
                    >
                        <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                        <span className="font-semibold text-lg">{plan.name}</span>
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-xs text-muted-foreground">{plan.description}</span>
                  </Label>
                ))}
            </RadioGroup>
            
            <div className='space-y-4 rounded-lg border p-4'>
                <p className='text-sm text-center'>
                    To complete your purchase, send <strong>{selectedPlan?.price ? `$${selectedPlan.price}` : ''} USDT</strong> on the <strong>BEP-20 Network</strong> to the address below.
                </p>
                <div className="space-y-2">
                    <Label>USDT (BEP-20) Wallet Address</Label>
                     <div className="flex items-center gap-2">
                        <Input
                            readOnly
                            value={walletAddress}
                            className="font-mono text-sm"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleCopy}
                            aria-label="Copy wallet address"
                        >
                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                 <div className="p-4 bg-white rounded-md flex justify-center">
                    <Image
                        src="/qrcode.jpg"
                        alt="USDT BEP-20 Wallet QR Code"
                        width={180}
                        height={180}
                        className="rounded-lg"
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId">1. Transaction Hash/ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Paste your transaction hash here, e.g. 0x..."
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

               <div className="space-y-2">
                <Label htmlFor="payment-proof">2. Upload Payment Screenshot</Label>
                <Input
                  id="payment-proof"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  accept="image/png, image/jpeg, image/gif"
                  required
                  className="pt-2 text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                />
                {paymentProofFile && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Selected: {paymentProofFile.name}
                    </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || isUserLoading}>
                {isSubmitting ? 'Submitting for Verification...' : 'Submit Payment Proof'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Your account will be upgraded within 24 hours after payment verification.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-primary" />
      <span>{children}</span>
    </div>
  );
}

    
