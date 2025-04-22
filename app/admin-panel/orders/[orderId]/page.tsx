'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Truck,
  MessageSquareText,
  ArrowLeft,
} from 'lucide-react';
import Button from '../../components/Button';
import { OrderStatusBadge } from '@/app/admin-panel/components/Badge';
import Card from '../../components/card/Card';
import CardContent from '../../components/card/CardContent';
import CardHeader from '../../components/card/CardHeader';
import CardTitle from '../../components/card/CardTitle';
import { Input } from '@/components/ui/Input';
import { OrdersSkeleton } from '@/components/skeltons/OrdersAdminSkelton';

interface Order {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  products: {
    id: string;
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }[];
  totals: {
    YER: number;
    SAR: number;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'declined';
  createdAt: string;
  statusHistory: {
    status: string;
    message?: string;
    timestamp: string;
    user: {
      name: string;
    };
  }[];
}

const SingleOrderPage = () => {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${params.orderId}`);
        if (!response.ok) throw new Error('فشل في جلب بيانات الطلب');
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.log(err)
        setError('فشل تحميل تفاصيل الطلب');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.orderId]);

  const handleUpdateStatus = async (newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/admin/orders/${params.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          message 
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder((prev) =>
          prev ? { ...prev, status: updatedOrder.status } : null
        );
        setMessage('');
      }
    } catch (err) {
      console.error('فشل تحديث الحالة:', err);
    }
  };

  const handleSendMessage = () => {
    if (!order?.phone) return;
    const whatsappUrl = `https://wa.me/${order.phone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return <OrdersSkeleton/>;
  if (error) return <div className="p-6 text-red-500 text-center ">{error}</div>;
  if (!order) return <div className="p-6 text-center text-4xl">الطلب غير موجود</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button variant="default" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        العودة إلى الطلبات
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* معلومات العميل */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">تفاصيل العميل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-sm text-gray-600">{order.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">عنوان التوصيل</p>
              <p className="text-sm text-gray-600">{order.address}</p>
            </div>
            <div>
              <p className="text-sm font-medium">حالة الطلب</p>
              <OrderStatusBadge status={order.status} />
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل الطلب */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      SAR {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4">
                  <div>
                    <p className="font-medium">المجموع (SAR)</p>
                    <p className="font-medium text-lg">
                      SAR {order.totals.SAR.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">المجموع (YER)</p>
                    <p className="font-medium text-lg">
                      YER {order.totals.YER.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تتبع حالة الطلب */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تتبع حالة الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 border-t border-gray-200">
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute right-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-8">
                      {order.statusHistory.map((entry, index) => (
                        <div key={index} className="relative flex items-start gap-4 pr-10">
                          {/* Timeline dot */}
                          <div
                            className={`relative z-10 w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            {index < order.statusHistory.length - 1 && (
                              <div className="absolute top-3 -bottom-8 right-1 w-0.5 bg-gray-200"></div>
                            )}
                          </div>
                          {/* Status content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <OrderStatusBadge status={entry.status} />
                              <span className="text-sm text-gray-500">
                                {new Date(entry.timestamp).toLocaleDateString('ar-EG', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {entry.message && (
                              <p className="mt-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {entry.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* إجراءات الطلب */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إجراءات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                className='mb-4'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="أضف رسالة تحديث الحالة..."
                />
                <div className="flex gap-2 flex-wrap">
                  {order.status === 'pending' && (
                    <>
                      <Button
                      className='flex items-center gap-1'
                        variant="success"
                        onClick={() => handleUpdateStatus('confirmed')}
                      >
                        <span>قبول الطلب </span>
                        <CheckCircle className="w-4 h-4 mr-2" />
                      </Button>
                      <Button
                        className='flex items-center gap-1'
                        variant="destructive"
                        onClick={() => handleUpdateStatus('declined')}
                      >
                       <span> رفض الطلب</span>
                        <XCircle className="w-4 h-4 mr-2" />
                      </Button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <Button onClick={() => handleUpdateStatus('processing')}>
                      <Truck className="w-4 h-4 mr-2" />
                      وضع الطلب قيد التجهيز
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button
                      variant="success"
                      onClick={() => handleUpdateStatus('delivered')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      تسليم الطلب
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleSendMessage}>
                    <MessageSquareText className="w-4 h-4 mr-2" />
                    إرسال رسالة واتساب
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SingleOrderPage;
