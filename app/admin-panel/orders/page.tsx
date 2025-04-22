'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { statusOptions, sortOptions } from '../constants';
import { Order, OrdersStats, Pagination } from '../types';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { OrdersSkeleton } from '@/components/skeltons/OrdersAdminSkelton';
import AllOrders from '../components/orders/AllOrders';
import LatestOrders from '../components/orders/LatestOrders';
import StatsCards from '../components/orders/StatsCards';
import { Search } from 'lucide-react';

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestOrders, setLatestOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrdersStats>({ 
    newOrders: 0, 
    confirmedOrders: 0, 
    deliveredOrders: 0 
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    perPage: 10,
    total: 0
  });

  const fetchInitialData = async () => {
    try {
      const response = await fetch(`/api/admin/orders`);
      const data = await response.json();
      
      if (response.ok) {
        setLatestOrders(data.latestOrders || []);
        setOrderStats(data.orderStats || { 
          newOrders: 0, 
          confirmedOrders: 0, 
          deliveredOrders: 0 
        });
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
    finally {
      setInitialLoading(false)
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setIsOrdersLoading(true);
      const queryString = new URLSearchParams({
        search: debouncedSearchQuery,
        status: statusFilter,
        sort: sortOrder,
        page: pagination.page.toString(),
        limit: pagination.perPage.toString()
      }).toString();

      const response = await fetch(`/api/admin/orders?${queryString}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0
        }));
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsOrdersLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, sortOrder, pagination.page, pagination.perPage]);

  // Update useEffect dependencies
  useEffect(() => {
    if (!initialLoading) {
      fetchOrders();
    }
  }, [debouncedSearchQuery, statusFilter, sortOrder, pagination.page, pagination.perPage, initialLoading, fetchOrders]);
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updateResponse = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (updateResponse.ok) {
        // Refresh all data in parallel
        await Promise.all([
          fetchInitialData(), // Updates stats and latest orders
          fetchOrders(),      // Updates main orders list
        ]);
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(pagination.total / pagination.perPage)) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value);
    setPagination(prev => ({
      ...prev,
      perPage: newPerPage,
      page: 1
    }));
  };

  if (initialLoading) return <OrdersSkeleton />;

  const totalPages = Math.ceil(pagination.total / pagination.perPage);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">إدارة الطلبات</h1>
      
      <StatsCards orderStats={orderStats} />
      
      <LatestOrders
        title="أحدث الطلبات"
        orders={latestOrders}
        onConfirm={(orderId) => updateOrderStatus(orderId, 'confirmed')}
        onDeliver={(orderId) => updateOrderStatus(orderId, 'delivered')}
        onDecline={(orderId) => updateOrderStatus(orderId, 'declined')}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex items-center w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن طلب (رقم الطلب)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto"
        />
        <Select
          options={sortOptions}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
          className="w-full md:w-auto"
        />
      </div>

      <AllOrders 
        orders={orders} 
        isLoading={isOrdersLoading}
        onOrderClick={(orderId) => router.push(`/admin-panel/orders/${orderId}`)}
        pagination={pagination}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  );
}

export default OrdersPage;