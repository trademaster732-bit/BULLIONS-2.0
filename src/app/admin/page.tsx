'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { User, Payment } from '@/lib/types';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import AdminPanel from '@/components/admin-panel';
import { add } from 'date-fns';

export interface AdminStats {
  totalUsers: number;
  monthlyPremiumUsers: number;
  annualPremiumUsers: number;
  freeUsers: number;
  adminUsers: number;
}


export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: currentUser, isLoading: isCurrentUserLoading } = useDoc<User>(userDocRef);

  const usersCollectionRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers, isLoading: usersLoading } = useCollection<User>(usersCollectionRef);

  const paymentsCollectionRef = useMemoFirebase(() => collection(firestore, 'payments'), [firestore]);
  const pendingPaymentsQuery = useMemoFirebase(() => 
    query(paymentsCollectionRef, where('status', '==', 'PENDING')), 
    [paymentsCollectionRef]
  );
  const { data: pendingPayments, isLoading: paymentsLoading } = useCollection<Payment>(pendingPaymentsQuery);

  useEffect(() => {
    if (!isUserLoading && !isCurrentUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (currentUser && currentUser.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, isUserLoading, currentUser, isCurrentUserLoading, router]);

  const adminStats = useMemo<AdminStats>(() => {
    if (!allUsers) {
      return { totalUsers: 0, monthlyPremiumUsers: 0, annualPremiumUsers: 0, freeUsers: 0, adminUsers: 0 };
    }

    const stats: AdminStats = {
      totalUsers: allUsers.length,
      monthlyPremiumUsers: 0,
      annualPremiumUsers: 0,
      freeUsers: 0,
      adminUsers: 0,
    };

    allUsers.forEach(usr => {
      switch (usr.role) {
        case 'PREMIUM_USER':
          if (usr.subscription?.planId === 'annual') {
            stats.annualPremiumUsers++;
          } else {
            stats.monthlyPremiumUsers++;
          }
          break;
        case 'FREE_USER':
          stats.freeUsers++;
          break;
        case 'ADMIN':
          stats.adminUsers++;
          break;
      }
    });
    // Adjust total to not double-count admins if they are also users
    stats.totalUsers = stats.monthlyPremiumUsers + stats.annualPremiumUsers + stats.freeUsers + stats.adminUsers;


    return stats;
  }, [allUsers]);


  const handleApprovePayment = useCallback((payment: Payment) => {
    if (!user) return;
    const paymentDocRef = doc(firestore, 'payments', payment.id);
    updateDocumentNonBlocking(paymentDocRef, {
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewerId: user.uid,
    });

    const targetUserDocRef = doc(firestore, 'users', payment.userId);
    const now = new Date();
    const subscriptionDuration = payment.planId === 'annual' ? { years: 1 } : { months: 1 };
    const endDate = add(now, subscriptionDuration);
    
    updateDocumentNonBlocking(targetUserDocRef, {
      role: 'PREMIUM_USER',
      subscription: {
        planId: payment.planId,
        status: 'ACTIVE',
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        renewsOn: endDate.toISOString(), // Placeholder, adjust if you have auto-renewal
      },
    });

    toast({
      title: 'Payment Approved',
      description: `User ${payment.userEmail} has been upgraded to Premium.`,
    });
  }, [user, firestore, toast]);

  const handleRejectPayment = (payment: Payment) => {
    if (!user) return;
    const paymentDocRef = doc(firestore, 'payments', payment.id);
    updateDocumentNonBlocking(paymentDocRef, {
      status: 'REJECTED',
      reviewedAt: new Date().toISOString(),
      reviewerId: user.uid,
    });
    toast({
      variant: 'destructive',
      title: 'Payment Rejected',
      description: `Payment for ${payment.userEmail} has been rejected.`,
    });
  };
  
  const handleManualRoleChange = (
    userId: string, 
    newRole: 'FREE_USER' | 'PREMIUM_USER' | 'ADMIN', 
    planId?: 'monthly' | 'annual'
  ) => {
    const targetUserDocRef = doc(firestore, 'users', userId);
    
    if (newRole === 'PREMIUM_USER' && planId) {
      const now = new Date();
      const subscriptionDuration = planId === 'annual' ? { years: 1 } : { months: 1 };
      const endDate = add(now, subscriptionDuration);
      
      updateDocumentNonBlocking(targetUserDocRef, {
        role: 'PREMIUM_USER',
        subscription: {
          planId: planId,
          status: 'ACTIVE',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          renewsOn: endDate.toISOString(),
        },
      });
      toast({
        title: 'User Upgraded',
        description: `User has been upgraded to Premium (${planId}).`,
      });
    } else if (newRole === 'FREE_USER') { // Downgrading to Free User
      updateDocumentNonBlocking(targetUserDocRef, { 
        role: 'FREE_USER',
        subscription: null // Remove subscription details on downgrade
      });
      toast({
        title: 'User Role Updated',
        description: `User role has been changed to FREE_USER.`,
      });
    } else if (newRole === 'ADMIN') { // Promoting to Admin
      updateDocumentNonBlocking(targetUserDocRef, { 
        role: 'ADMIN',
        subscription: null
      });
      toast({
        title: 'User Promoted',
        description: `User has been promoted to ADMIN.`,
      });
    }
  }

  const isLoading = isUserLoading || isCurrentUserLoading || !currentUser;

  if (isLoading || (currentUser && currentUser.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
        <Skeleton className="h-10 w-full max-w-4xl" />
        <Skeleton className="h-64 w-full max-w-4xl mt-4" />
      </div>
    );
  }

  return (
    <AdminPanel 
      stats={adminStats}
      allUsers={allUsers || []}
      pendingPayments={pendingPayments || []}
      onApprovePayment={handleApprovePayment}
      onRejectPayment={handleRejectPayment}
      onManualRoleChange={handleManualRoleChange}
      usersLoading={usersLoading}
      paymentsLoading={paymentsLoading}
    />
  );
}
