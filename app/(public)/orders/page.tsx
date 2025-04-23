'use client';

import AuthController from '@/components/model/auth/AuthController';
import { Currency, Product } from '@prisma/client';
import { motion } from 'framer-motion';
import { Package, MapPin, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { OrderStatusBadge } from '@/app/admin-panel/components/Badge';

interface ProductWithCurrency extends Product {
  currency: Currency;
}

interface OrderHistoryEntry {
  status: 'pending' | 'processing' | 'delivered' | 'declined' |"confirmed";
  timestamp: string;
  message?: string | null;
}

interface Order {
  id: string;
  createdAt: string;
  address: string;
  products: {
    product: ProductWithCurrency;
    quantity: number;
  }[];
  totals: {
    YER: number;
    SAR: number;
  };
  statusHistory: OrderHistoryEntry[];
}

export default function OrdersPage() {
  const { status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/store-data/orders', {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac)"
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data, 'fetched orders data');
          // Ensure orders is an array (empty array if no orders are returned)
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') fetchOrders();
  }, [status]);

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            يرجى تسجيل الدخول لعرض الطلبات
          </h2>
          <AuthController title='سجل الدخول' />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-blue-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4 font-cairo">
            طلباتي
          </h1>
          <p className="text-gray-700 font-noto-arabic">
            عرض جميع الطلبات السابقة وتتبع حالة الشحن
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
              >
                {/* Header Skeleton */}
                <div className="p-6 bg-gray-50 animate-pulse">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="h-5 bg-gray-200 rounded w-32"></div>
                      <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-200 w-36">
                      <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>

                {/* Items Skeleton */}
                <div className="p-6">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2].map((j) => (
                      <div key={j} className="flex justify-between items-center py-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="flex space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Skeleton */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="mx-auto mb-8 text-primary">
              <Package className="w-16 h-16 inline-block" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 font-cairo">
              لا توجد طلبات حالية
            </h2>
            <p className="text-gray-700 mb-8 font-noto-arabic">
              يمكنك البدء بالتسوق وستظهر طلباتك هنا
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white shadow-xl rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Order Header */}
                <div className="p-6 bg-gradient-to-r from-primary to-orange-500 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-cairo text-base font-bold">
                        رقم الطلب :
                      </span>
                      <span className="font-bold text-base">{order.id}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-base font-bold">
                        عنوان التسليم:
                      </span>
                      <span className="text-base">{order.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-base font-bold">
                        تاريخ الطلب:
                      </span>
                      <span className="text-base">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Products */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 font-cairo text-gray-800">
                    المنتجات المطلوبة:
                  </h3>
                  <div className="space-y-4">
                    {order.products.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-200"
                      >
                        <span className="text-base text-gray-700">{item.product.name}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">x{item.quantity}</span>
                          <span className="text-indigo-600 font-semibold">
                            {item.product.price} {item.product.currency.name}
                          </span>
                          {item.product.discount?.isVaild && (
                            <span className="bg-primary text-white px-2 py-1 rounded-lg text-sm">
                              {Math.round(
                                ((item.product.price -
                                  item.product.discount.price) /
                                  item.product.price) *
                                  100
                              )}% خصم
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <span className="font-bold text-lg text-gray-700">المجموع الكلي:</span>
                    <div className="flex flex-col text-lg font-bold text-indigo-600">
                      {order.totals.YER > 0 && (
                        <span>{order.totals.YER} ريال يمني</span>
                      )}
                      {order.totals.SAR > 0 && (
                        <span>{order.totals.SAR} ريال سعودي</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order History Timeline */}
             {/* Order History Timeline */}
{order.statusHistory && order.statusHistory.length > 0 && (
  <div className="p-6 border-t border-gray-200">
    <h3 className="text-xl font-bold mb-6 font-cairo text-gray-800">تتبع حالة الطلب</h3>
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute right-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>
      
      <div className="space-y-8">
        {order.statusHistory.map((entry, index) => (
          <div key={index} className="relative flex items-start gap-4 pr-10">
            {/* Timeline dot */}
            <div className={`relative z-10 w-3 h-3 rounded-full ${
              index === 0 ? 'bg-primary' : 'bg-gray-300'
            }`}>
              {/* Connector line */}
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
                        minute: '2-digit'
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
    )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
