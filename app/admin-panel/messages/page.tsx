// app/notifications/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SkeletonProductCard } from '@/components/skeltons/ProductSkelton';


interface MessageType {
    id: string;
   name:string,
   mobile:string,
   content:string
    createdAt: Date;
    updatedAt: Date;
    user:{
        name:string;
        mobile:string
    }
}
const MessagesPage = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  const fetchMessages = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/admin/messages?page=${page||1}&limit=${pagination.limit}`);
      const data = await res.json();
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]); // Add dependencies used in the function

  useEffect(() => {
    fetchMessages(pagination.page);
  }, [pagination.page, fetchMessages]); // Add fetchLogs to dependencies


  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">سجل الرسائل</h1>
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
                messages.length?messages.map((message) => (
                    <div key={message.id} className="p-4 border-b hover:bg-gray-50 transition-colors  ">
                      <div className="flex flex-col items-start gap-2">
                      <div className="flex items-center gap-4">
                          <div className="flex items-center ">
                            <span className="font-medium text-slate-500">{message.name} -</span>
                            
                          </div>
                          <p className="text-slate-500 mt-1">
                            {message.mobile}
                            
                          </p>
                        </div>
                      <div className="p-2 rounded-xl bg-gray-800 flex flex-col">
                          <span>{message.content}</span>
                          <span className="text-gray-500 text-sm self-end">
                              {new Date(message.createdAt).toLocaleDateString('ar-EG', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                        </div>
                      </div>
                    </div>
                  ))
                  :
                  <div className=''>لاتوجد رسائل حاليا</div>
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

export default MessagesPage;