// components/admin/StatsGrid.tsx
'use client';
import { StatsGridSkeleton } from '@/components/skeltons/StatsGridSkelton';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export interface StatsData {
  totalOrders: number;
  totalProducts: number;
  currencyStats: {
    sar: {
      revenue: number;
      profit: number;
    };
    yer: {
      revenue: number;
      profit: number;
    };
  };
}

function StatsGrid({ data }: { data: StatsData | null }) {
  if (!data) return <StatsGridSkeleton />;

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Basic Stats */}
      <StatCard
        title="إجمالي الطلبات"
        value={data.totalOrders.toLocaleString('ar-SA')}
        icon={ShoppingCart}
        color="bg-blue-100 text-blue-600"
      />
      
      <StatCard
        title="المنتجات المتاحة"
        value={data.totalProducts.toLocaleString('ar-SA')}
        icon={Package}
        color="bg-green-100 text-green-600"
      />

      {/* Revenue Card */}
      <StatCard
        title="الإيرادات"
        value={
          <div className="flex flex-col space-y-0.5 sm:space-y-1">
            <CurrencyRow value={formatCurrency(data.currencyStats.sar.revenue, 'SAR')} />
            <CurrencyRow value={formatCurrency(data.currencyStats.yer.revenue, 'YER')} />
          </div>
        }
        icon={DollarSign}
        color="bg-purple-100 text-purple-600"
      />

      {/* Profit Card */}
      <StatCard
        title="الأرباح"
        value={
          <div className="flex flex-col space-y-0.5 sm:space-y-1">
            <CurrencyRow value={formatCurrency(data.currencyStats.sar.profit, 'SAR')} />
            <CurrencyRow value={formatCurrency(data.currencyStats.yer.profit, 'YER')} />
          </div>
        }
        icon={TrendingUp}
        color="bg-yellow-100 text-yellow-600"
      />
    </div>
  );
}

// Currency Row Component
const CurrencyRow = ({ value }: { value: string }) => (
  <div className="flex items-baseline gap-1 text-sm sm:text-base select-none">
    <span className="truncate text-xl sm:text-2xl">{value}</span>
  </div>
);

// Responsive StatCard Component
interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  color: `bg-${string}`;
}

export const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-4 sm:p-6 rounded-xl ${color} select-none flex flex-col items-center justify-center gap-2 min-h-[100px] sm:min-h-[140px] relative overflow-hidden transition-all`}
  >
    {/* Icon Container */}
    <div className={`absolute top-0 right-0 p-1.5 sm:p-2 rounded-bl-xl ${color.replace('bg-', 'bg-opacity-20 ')}`}>
      <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
    </div>

    {/* Content */}
    <div className="text-center space-y-1 sm:space-y-2">
      <p className="text-xs sm:text-sm font-semibold">{title}</p>
      <div className="text-2xl sm:text-3xl font-bold">
        {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
      </div>
    </div>

    {/* Accent Border */}
    <div className={`absolute bottom-0 left-0 right-0 h-1 ${color.replace('bg-', '')} opacity-50`} />
  </motion.div>
);

export default StatsGrid;