'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, ChevronLeft, ChevronRight, User, Phone, LockOpen, Lock } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/card/Card';
import CardHeader from '../components/card/CardHeader';
import CardTitle from '../components/card/CardTitle';
import CardContent from '../components/card/CardContent';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import ConfirmationModal, { ModalStatus } from '../components/ConfirmModal';
import { UsersStats } from '../components/UsersStats';

interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  ordersCount: number;
  lastLogin: string;
  isBlocked:boolean
  createdAt: string;
}

interface UsersStats {
  totalUsers: number;
  totalActiveUsers: number;
  totalPurchasingUsers: number;
  topUsers: User[];
}

const AdminUsersPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals state
  const [blockModalStatus, setBlockModalStatus] = useState<ModalStatus>(null);
  const [selectedBlockUser, setSelectedBlockUser] = useState<User | null>(null);
  const [blockErrorMessage, setBlockErrorMessage] = useState<string>('');



  useEffect(() => {
    if (session && !session.user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
       
        // Fetch users
        const usersRes = await fetch(
          `/api/admin/users?page=${currentPage}&search=${searchQuery}`
        );
        const usersData = await usersRes.json();
        setStats(usersData.stats)
        console.log(usersData,'user data')
        setUsers(usersData.users);
        setTotalItems(usersData.pagination.total);
        setTotalPages(usersData.pagination.totalPages);
      } catch (err) {
        console.log(err)
        setError('فشل في تحميل بيانات المستخدمين');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, router, currentPage, searchQuery]);

 

  const openBlockModal = (user: User) => {
    setSelectedBlockUser(user);
    setBlockModalStatus('confirming');
  };

  const handleConfirmBlock = async () => {
    if (!selectedBlockUser) return;
    setBlockModalStatus('processing');
    
    try {
      const response = await fetch(`/api/admin/users/${selectedBlockUser.id}/access`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !selectedBlockUser.isBlocked }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === selectedBlockUser.id ? 
          { ...u, isBlocked: !u.isBlocked } : u
        ));
        setBlockModalStatus('success');
        setTimeout(() => {
          setBlockModalStatus(null);
          setSelectedBlockUser(null);
        }, 1500);
      } else {
        throw new Error('فشل في تحديث حالة المستخدم');
      }
    } catch (err) {
      console.log(err)
      setBlockErrorMessage('حدث خطأ أثناء عملية التحديث');
      setBlockModalStatus('error');
    }
  };


  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (loading) return <UsersSkeleton />;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Stats Grid */}
      {stats && (
        <div className="mb-6">
          <UsersStats data={{
            totalUsers: stats.totalUsers,
            totalActiveUsers: stats.totalActiveUsers,
            totalPurchasingUsers: stats.totalPurchasingUsers,
            topUsers: stats.topUsers
          }} />
        </div>
      )}

      {/* Search and Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">المستخدمين ({totalItems})</h1>
        <Input
          placeholder="ابحث بالاسم أو الجوال..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-64"
        />
      </div>

      {/* Users Table */}
      <Card className="relative">
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الجوال</TableHead>
                <TableHead>عدد الطلبات</TableHead>
                <TableHead>آخر دخول</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <User className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-600">لا يوجد مستخدمين</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell data-label="الاسم" className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" />
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell data-label="الجوال">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-gray-500" />
                        {user.mobile}
                      </div>
                    </TableCell>
                   
                    <TableCell data-label="عدد الطلبات" className="text-center">
                      {user.ordersCount}
                    </TableCell>
                    <TableCell data-label="آخر دخول">
                      {new Date(user.lastLogin).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell data-label="تاريخ التسجيل">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell data-label="الإجراءات">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => router.push(`/admin-panel/users/${user.id}`)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <span>تفاصيل</span>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                        onClick={() => openBlockModal(user)}
                        variant={user.isBlocked ? 'default' : 'destructive'}
                        className="flex items-center gap-2"
                      >
                        <span>{user.isBlocked ? 'رفع الحظر' : 'حظر'}</span>
                        {user.isBlocked ? (
                          <LockOpen className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : 
                            currentPage >= totalPages - 2 ? totalPages - 4 + i : 
                            currentPage - 2 + i;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        status={blockModalStatus}
        onClose={() => {
          setBlockModalStatus(null);
          setSelectedBlockUser(null);
        }}
        onConfirm={handleConfirmBlock}
        title={selectedBlockUser?.isBlocked ? 'تأكيد رفع الحظر' : 'تأكيد الحظر'}
        description={
          <>
            هل أنت متأكد من رغبتك في {selectedBlockUser?.isBlocked ? 'رفع الحظر عن' : 'حظر'} المستخدم{' '}
            <strong>{selectedBlockUser?.name}</strong>؟
          </>
        }
        processingTitle="جارٍ التحديث"
        processingDescription="يرجى الانتظار أثناء عملية التحديث"
        successTitle={selectedBlockUser?.isBlocked ? 'تم رفع الحظر بنجاح' : 'تم الحظر بنجاح'}
        successDescription={`تم ${selectedBlockUser?.isBlocked ? 'رفع الحظر عن' : 'حظر'} المستخدم بنجاح`}
        errorTitle="فشل التحديث"
        errorDescription="حدث خطأ أثناء عملية التحديث"
        errorMessage={blockErrorMessage}
        confirmLabel={selectedBlockUser?.isBlocked ? 'تأكيد رفع الحظر' : 'تأكيد الحظر'}
        cancelLabel="إلغاء"
        retryLabel="محاولة مرة أخرى"
      />
    </div>
  );
};

// Skeleton Loader
const UsersSkeleton = () => (
  <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
    <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

export default AdminUsersPage;