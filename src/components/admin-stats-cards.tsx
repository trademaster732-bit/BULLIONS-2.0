'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStats } from '@/app/admin/page';
import { Users, ShieldCheck, Gem, User, UserX } from 'lucide-react';

interface AdminStatsCardsProps {
  stats: AdminStats;
  isLoading: boolean;
}

export default function AdminStatsCards({ stats, isLoading }: AdminStatsCardsProps) {
  const statItems = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Monthly Premium', value: stats.monthlyPremiumUsers, icon: ShieldCheck, color: 'text-green-500' },
    { title: 'Annual Premium', value: stats.annualPremiumUsers, icon: Gem, color: 'text-purple-500' },
    { title: 'Free Users', value: stats.freeUsers, icon: User, color: 'text-gray-500' },
    { title: 'Admins', value: stats.adminUsers, icon: UserX, color: 'text-red-500' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="p-4 md:p-5">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-7 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-5">
      {statItems.map((item, index) => (
        <Card key={index} className="text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 pb-2">
            <item.icon className={`h-5 w-5 mr-0 md:mr-2 ${item.color}`} />
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
