import { Clock, CheckCircle, Truck } from 'lucide-react';
import { StatCard } from '../StatsGrid';
import { OrdersStats } from '../../types';

interface StatsCardsProps {
  orderStats: OrdersStats;
}

 const StatsCards = ({ orderStats }: StatsCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard
      title="طلبات جديدة"
      value={orderStats.newOrders}
      icon={Clock}
      color="bg-yellow-100 text-yellow-600"
    />
    <StatCard
      title="طلبات تم الموافقة عليها"
      value={orderStats.confirmedOrders}
      icon={CheckCircle}
      color="bg-blue-100 text-blue-600"
    />
    <StatCard
      title="طلبات تم التسليم"
      value={orderStats.deliveredOrders}
      icon={Truck}
      color="bg-green-100 text-green-600"
    />
  </div>
);

export default StatsCards