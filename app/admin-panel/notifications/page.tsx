// app/notifications/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserPlus, Edit, Trash, Package, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SkeletonProductCard } from '@/components/skeltons/ProductSkelton';

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'CREATE_USER':
      return <UserPlus className="w-5 h-5 text-green-500" />;
    case 'UPDATE_PRODUCT':
      return <Edit className="w-5 h-5 text-blue-500" />;
    case 'DELETE_PRODUCT':
      return <Trash className="w-5 h-5 text-red-500" />;
    case 'CREATE_BANNER':
      return <Megaphone className="w-5 h-5 text-purple-500" />;
    default:
      return <Package className="w-5 h-5 text-gray-500" />;
  }
};
interface LogsType {
    id: string;
    actionType: string;
    entityType: string;
    entityId: string;
    userId: string;
    details: string | null;
    createdAt: Date;
    updatedAt: Date;
    user:{
        name:string;
        mobile:string
    }
}
const NotificationPage = () => {
  const [logs, setLogs] = useState<LogsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const fetchLogs = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/admin/logs?page=${page||1}&limit=${pagination.limit}`);
      const data = await res.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]); // Add dependencies used in the function

  useEffect(() => {
    fetchLogs(pagination.page);
  }, [pagination.page, fetchLogs]); // Add fetchLogs to dependencies


  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">سجل الأنشطة</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b">
              <SkeletonProductCard  />
            </div>
          ))
        ) : (
          <>
            {
                logs.length?logs.map((log) => (
                    <div key={log.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-gray-100">
                          {getActionIcon(log.actionType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.user.name}</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(log.createdAt).toLocaleDateString('ar-EG', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">
                            {log.actionType.replace(/_/g, ' ')} - {log.entityType}
                            {log.details && <span className="text-gray-500 ml-2">({log.details})</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                  :
                  <div className=''>لاتوجد انشطه حاليا</div>
            }

            <div className="p-4 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                السابق
              </Button>
              <div className="text-sm text-gray-600">
                صفحة {pagination.page} من {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                التالي
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;