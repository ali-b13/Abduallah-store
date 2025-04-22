'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/app/admin-panel/components/card/Card';
import CardHeader from '@/app/admin-panel/components/card/CardHeader';
import CardTitle from '@/app/admin-panel/components/card/CardTitle';
import CardContent from '@/app/admin-panel/components/card/CardContent';
import { toast, Toaster } from 'react-hot-toast';
import { LoadingSpinner } from '@/components/LoaderSpinner';

const SettingsPage = () => {
  const { update } = useSession();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
  });

  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

 const fetchProfile=async()=>{
    try {
        const response = await fetch('/api/admin/profile', {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
            const data=await response.json()
            console.log(data,'data')
         setFormData({name:data.user.name,mobile:data.user.mobile})
        } 
      } catch (error) {
        console.log(error)
        toast.error('حدث خطأ أثناء التحديث');
      }finally{
        setLoading(false)
      }
 }
 
 
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
          await update();
          toast.success('تم تحديث الملف الشخصي بنجاح');
        } else {
            throw new Error('فشل في تحديث البيانات');
        }
    } catch (error) {
        console.log(error)
        toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    console.log("handled click")
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
        toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }


    
    try {
      const response = await fetch('/api/admin/profile/security', {
          method: 'PUT',
          headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });
   console.log(response,'res')
      if (response.ok) {
          toast.success('تم تغيير كلمة المرور بنجاح');
          setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error('فشل في تغيير كلمة المرور');
      }
    } catch (error) {
        console.log(error)
      toast.error('كلمة المرور الحالية غير صحيحة');
    } 
  };

  useEffect(()=>{
    fetchProfile()
  },[])

  if(loading) return <LoadingSpinner/>

  return (
      <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              الملف الشخصي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">الاسم</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={loading}
                  />
                </div>
                

                <div className="space-y-2">
                  <label className="block text-sm font-medium">رقم الجوال</label>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                حفظ التغييرات
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              الأمان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">كلمة المرور الحالية</label>
                  <Input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">تأكيد كلمة المرور</label>
                  <Input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                تغيير كلمة المرور
              </Button>
            </form>
          </CardContent>
        </Card>
<Toaster/>
      </div>
    </div>
  );
};

export default SettingsPage;