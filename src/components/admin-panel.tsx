
'use client';

import { User, Payment } from '@/lib/types';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle2, UserCog, Users, LogOut, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import AdminStatsCards from '@/components/admin-stats-cards';
import type { AdminStats } from '@/app/admin/page';
import SubscriptionCountdown from './subscription-countdown';
import Image from 'next/image';


interface AdminPanelProps {
  stats: AdminStats;
  allUsers: User[];
  pendingPayments: Payment[];
  onApprovePayment: (payment: Payment) => void;
  onRejectPayment: (payment: Payment) => void;
  onManualRoleChange: (userId: string, newRole: 'FREE_USER' | 'PREMIUM_USER' | 'ADMIN', planId?: 'monthly' | 'annual') => void;
  usersLoading: boolean;
  paymentsLoading: boolean;
}

export default function AdminPanel({
  stats,
  allUsers,
  pendingPayments,
  onApprovePayment,
  onRejectPayment,
  onManualRoleChange,
  usersLoading,
  paymentsLoading,
}: AdminPanelProps) {
  const auth = useAuth();

  const handleLoginAsUser = (userId: string) => {
    // This is a simplified impersonation for client-side.
    // In a real-world scenario, this would involve secure custom tokens.
    if (!auth.currentUser) return;
    const adminId = auth.currentUser.uid;
    localStorage.setItem('adminId', adminId);
    localStorage.setItem('impersonatingUserId', userId);
    // In a full implementation, you would then sign in with a custom token for the user.
    // For now, we redirect and the dashboard will pick up the impersonation.
    window.location.href = '/dashboard';
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="font-serif text-3xl md:text-4xl font-bold flex items-center gap-3">
            <UserCog className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            Admin Panel
          </h1>
          <Button variant="outline" onClick={() => auth.signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>
        
        <AdminStatsCards stats={stats} isLoading={usersLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <CheckCircle2 className="text-primary" />
                Pending Payment Approvals
                <Badge>{pendingPayments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : pendingPayments.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                  {pendingPayments.map(payment => (
                    <div key={payment.id} className="p-3 border rounded-lg bg-background/50 space-y-2">
                      <div className='flex justify-between items-start'>
                        <div>
                            <p><strong>User:</strong> {payment.userEmail}</p>
                            <p className="text-sm text-muted-foreground break-all"><strong>TxID:</strong> {payment.transactionId}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{payment.planId}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(payment.submittedAt).toLocaleString()}
                      </p>
                      
                      <div>
                        <a href={payment.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block w-full cursor-pointer">
                            <Image
                                src={payment.paymentProofUrl}
                                alt="Payment Proof"
                                width={500}
                                height={100}
                                className="rounded-md object-cover w-full h-auto max-h-48 border hover:opacity-80 transition-opacity"
                            />
                        </a>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => onApprovePayment(payment)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => onRejectPayment(payment)}>Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending payments.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Users className="text-primary" />
                User Management
                <Badge>{allUsers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="max-h-96 overflow-y-auto custom-scrollbar mobile-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Subscription Ends</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map(usr => (
                        <TableRow key={usr.id}>
                          <TableCell className="font-medium break-all">{usr.email}</TableCell>
                          <TableCell>
                            <Badge variant={usr.role === 'ADMIN' ? 'destructive' : usr.role === 'PREMIUM_USER' ? 'default' : 'secondary'}>
                              {usr.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {usr.role === 'PREMIUM_USER' && usr.subscription?.endDate ? (
                              <SubscriptionCountdown endDate={usr.subscription.endDate} />
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                           <TableCell className="text-right">
                              {auth.currentUser?.uid !== usr.id && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleLoginAsUser(usr.id)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Login as User
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {usr.role === 'FREE_USER' && (
                                      <>
                                        <DropdownMenuItem onClick={() => onManualRoleChange(usr.id, 'PREMIUM_USER', 'monthly')}>
                                          Make Premium (Monthly)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onManualRoleChange(usr.id, 'PREMIUM_USER', 'annual')}>
                                          Make Premium (Annual)
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onManualRoleChange(usr.id, 'ADMIN')}>
                                          Make Admin
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                     {usr.role === 'PREMIUM_USER' && (
                                      <>
                                        <DropdownMenuItem onClick={() => onManualRoleChange(usr.id, 'FREE_USER')}>
                                          Make Free User
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onManualRoleChange(usr.id, 'ADMIN')}>
                                          Make Admin
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {usr.role === 'ADMIN' && (
                                      <DropdownMenuItem onClick={() => onManualRoleChange(usr.id, 'FREE_USER')}>
                                        Make Free User
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

    