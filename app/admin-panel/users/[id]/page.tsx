// app/admin-panel/users/[userId]/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, Mail, Phone, Package, MessageSquare } from 'lucide-react';
import Card from '../../components/card/Card';
import CardHeader from '../../components/card/CardHeader';
import CardTitle from '../../components/card/CardTitle';
import CardContent from '../../components/card/CardContent';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { LoadingSpinner } from '@/components/LoaderSpinner';
import { OrderStatusBadge } from '../../components/Badge';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  mobile: string;
  orders: Order[];
  messages: Message[];
  createdAt: string;
  lastLogin: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
}

interface Message {
  id: string;
  date: string;
  content: string;
}

const UserDetailsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.log(err)
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, router, params.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!userData) return <div>المستخدم غير موجود</div>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        ← العودة إلى قائمة المستخدمين
      </button>

      {/* User Info Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>معلومات المستخدم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{userData.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-500" />
              <span>{userData.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-500" />
              <span>{userData.mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>تاريخ التسجيل:</span>
              <span>
                {new Date(userData.createdAt).toLocaleDateString('ar-EG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              طلبات المستخدم ({userData.orders.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    {new Date(order.date).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell>{order.total.toFixed(2)} ر.س</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status}/>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              الرسائل ({userData.messages.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userData.messages.map((message) => (
              <div key={message.id} className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(message.date).toLocaleDateString('ar-EG', {
                    dateStyle: 'full',
                  })}
                </div>
                <p className="text-gray-800">{message.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



export default UserDetailsPage;