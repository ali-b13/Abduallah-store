// components/admin/StatsGrid.tsx
'use client';
import { User, ShoppingCart, LogIn, Trophy } from 'lucide-react';
import { StatCard } from './StatsGrid';

interface UsersStats {
  totalUsers: number;
  totalActiveUsers: number;
  totalPurchasingUsers: number;
  topUsers: Array<{
    name: string;
    ordersCount: number;
  }>;
}

export function UsersStats({ data }: { data: UsersStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        title="إجمالي المستخدمين"
        value={data.totalUsers.toLocaleString('ar-SA')}
        icon={User}
        color="bg-blue-100 text-blue-600"
      />

      <StatCard
        title="نشطون الآن"
        value={data.totalActiveUsers.toLocaleString('ar-SA')}
        icon={LogIn}
        color="bg-green-100 text-green-600"
      />

      <StatCard
        title="عملاء نشطين"
        value={data.totalPurchasingUsers.toLocaleString('ar-SA')}
        icon={ShoppingCart}
        color="bg-purple-100 text-purple-600"
      />

      <StatCard
        title="أفضل العملاء"
        value={
          <div className="space-y-1">
            {data.topUsers.length>0?data.topUsers.map((user, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="truncate">{user.name} -</span>
                <span>{user.ordersCount}</span>
              </div>
            )):<div className='text-sm'>لايوجد  طلبات مع المستخدمين</div>}
          </div>
        }
        icon={Trophy}
        color="bg-yellow-100 text-yellow-600"
      />
    </div>
  );
}
