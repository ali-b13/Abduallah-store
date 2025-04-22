'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Button from '../components/Button';
import CategoriesList from '../components/CategoryList';
import BannersList from '../components/BannerList';
import { toast } from 'react-hot-toast';
import ConfirmationModal, { ModalStatus } from '../components/ConfirmModal';
import { Category } from '@prisma/client';
import { SkeletonProductCard } from '@/components/skeltons/ProductSkelton';

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
}

export default function OverviewPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // === ConfirmationModal state ===
  const [deleteModalStatus, setDeleteModalStatus] = useState<ModalStatus>(null);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'category' | 'banner';
    id: string;
    name: string;
  } | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>('');

  const fetchdata = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
      const res2 = await fetch('/api/admin/banners');
      if (res2.ok) {
        const data2 = await res2.json();
        setBanners(data2.banners || data2);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdata();
  }, []);

  // === Replace direct delete with modal flow ===

  const handleRequestDelete = (
    type: 'category' | 'banner',
    id: string,
    name: string
  ) => {
    setSelectedItem({ type, id, name });
    setDeleteErrorMessage('');
    setDeleteModalStatus('confirming');
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setDeleteModalStatus('processing');
    try {
        if (selectedItem.type === 'category') {
            const res= await fetch(`/api/admin/categories/${selectedItem.id}`, { method: 'DELETE' });
            if(res.ok){
                 setCategories(cs => cs.filter(c => c.id !== selectedItem.id));
                 setDeleteModalStatus('success');
            }else {
                setDeleteModalStatus('error');

            }
        }else if(selectedItem.type=="banner"){
        const res= await fetch(`/api/admin/banners/${selectedItem.id}`, { method: 'DELETE' });
         if(res.ok){
            setBanners(bs => bs.filter(b => b.id !== selectedItem.id));
            setDeleteModalStatus('success');

         }else {
            setDeleteModalStatus('error');

         }
        }
        
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';

      setDeleteErrorMessage(errorMessage);
      setDeleteModalStatus('error');
    }
  };

  if (loading) return <SkeletonProductCard/>

  return (
    <div className="p-6 max-w-7xl mx-auto ">
      {/* Categories Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            
          <h2 className="text-xl font-semibold">الفئات</h2>
          <Button onClick={() => router.push('/admin-panel/categories/create-category')}>
            <Plus className="w-4 h-4 mr-2" /> اضافة فئة جديدة
          </Button>
        </div>
      

        <CategoriesList
          categories={categories}
          onEdit={id => router.push(`/admin-panel/categories/${id}`)}
          onDelete={(id:string, name:string) => handleRequestDelete('category', id, name)}
        />
          <div className="flex items-start gap-4 p-4 my-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md shadow-md">
                <svg
                    className="w-6 h-6 text-yellow-500 mt-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <div className="text-sm text-yellow-800 leading-relaxed">
                    <p className="font-bold text-yellow-700 mb-1">تحذير</p>
                    <p>
                    إذا قمت بحذف الفئة، سيتم أيضًا حذف جميع المنتجات المرتبطة بها. يرجى توخي الحذر قبل المتابعة.
                    </p>
                </div>
                </div>
      </section>

      {/* Banners Section */}
      <section>
        <div className="flex justify-between items-center my-4">
          <h2 className="text-xl font-semibold">البانرات</h2>
          <Button onClick={() => router.push('/admin-panel/categories/banners/create-banner')}>
            <Plus className="w-4 h-4 mr-2" /> اضافة بانر جديد
          </Button>
        </div>
        <BannersList
          banners={banners}
          onEdit={id => router.push(`/admin-panel/categories/banners/${id}`)}
          onDelete={(id:string, name:string) => handleRequestDelete('banner', id, name)}
        />
      </section>

      {/* Confirmation Modal */}
      <ConfirmationModal
        status={deleteModalStatus}
        onClose={() => {
          setDeleteModalStatus(null);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        description={
          <>
            هل أنت متأكد من رغبتك في حذف{' '}
            <strong>{selectedItem?.type === 'category' ? 'الفئة' : 'البانر'}</strong>{' '}
            <strong>{selectedItem?.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
          </>
        }
        processingTitle="جارٍ حذف العنصر"
        processingDescription="يرجى الانتظار أثناء عملية الحذف"
        successTitle="تم الحذف بنجاح"
        successDescription="تم حذف العنصر بنجاح"
        errorTitle="فشل الحذف"
        errorDescription="حدث خطأ أثناء عملية الحذف"
        errorMessage={deleteErrorMessage}
        confirmLabel="تأكيد الحذف"
        cancelLabel="إلغاء"
        retryLabel="حاول مجدداً"
      />
    </div>
  );
}
