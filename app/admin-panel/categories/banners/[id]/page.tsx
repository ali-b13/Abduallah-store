'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/app/admin-panel/components/Button';
import { Input } from '@/components/ui/Input';
import ConfirmationModal from '@/app/admin-panel/components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { Select } from '@/components/ui/Select';
import { Category } from '@prisma/client';
import ImageUpload from '@/app/admin-panel/components/ImageUploader';

interface BannerForm {
  title: string;
  categoryId: string;
  image: string;
  isAdvertising: boolean;
}

type ModalStatus = 'confirming' | 'processing' | 'success' | 'error' | null;

export default function EditBannerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState<BannerForm>({
    title: '',
    categoryId: '',
    image: '',
    isAdvertising: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [modalStatus, setModalStatus] = useState<ModalStatus>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        const opts = data.categories.map((ct: Category) => ({
          label: ct.name,
          value: ct.id,
        }));
        setCategories(opts);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetch(`/api/admin/banners/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load banner');
        return res.json();
      })
      .then(({ banner }) => {
        setForm({ 
          title: banner.title || '',
          categoryId: banner.categoryId || '',
          image: banner.image,
          isAdvertising: banner.isAdvertising
        });
        setImageUrls([banner.image]);
      })
      .catch(err => {
        toast.error(err.message);
        router.back();
      });
  }, [id, router]);

  const handleChange = (field: keyof Omit<BannerForm, 'image' | 'isAdvertising'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrls.length) {
      toast.error('الصورة مطلوبة');
      return;
    }
    if (!form.isAdvertising && (!form.title || !form.categoryId)) {
      toast.error('العنوان والرابط مطلوبين');
      return;
    }
    setModalStatus('confirming');
  };

  const handleConfirm = async () => {
    setModalStatus('processing');
    try {
      const bannerData = {
        ...form,
        image: imageUrls[0] // Use first image URL
      };

      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });
      
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update banner');
      }

      setModalStatus('success');
      setTimeout(() => {
        toast.success('تم تحديث البانر');
        router.push('/admin-panel/categories');
      }, 800);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setErrorMessage(errorMessage);
      setModalStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-right">
        <h1 className="text-3xl font-bold text-slate-800">تعديل البانر</h1>
        <p className="text-slate-600 mt-2">قم بتعديل بيانات البانر ثم احفظ التغييرات</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6 text-slate-800">
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-neutral-600">
            <input
              type="checkbox"
              checked={form.isAdvertising}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                isAdvertising: e.target.checked,
                ...(e.target.checked && { title: '', categoryId: '' })
              }))}
              className="w-4 h-4"
            />
            إعلان (لا يتطلب عنوان أو رابط)
          </label>
        </div>

        {!form.isAdvertising && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-400">عنوان البانر</label>
              <Input
                value={form.title}
                onChange={handleChange('title')}
                required={!form.isAdvertising}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-400">ربط الفئة</label>
              <Select
                options={categories}
                value={form.categoryId}
                onChange={(e) => setForm({...form, categoryId: e.target.value})}
                required={!form.isAdvertising}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-400">صورة البانر</label>
          <ImageUpload
            values={imageUrls}
            setImageUrls={setImageUrls}
            maxFiles={1}
            
          />
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button 
            className='text-slate-800' 
            variant="outline" 
            onClick={() => router.back()} 
            disabled={!!modalStatus}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={!!modalStatus}>
            حفظ التغييرات
          </Button>
        </div>
      </form>

      <ConfirmationModal
        status={modalStatus}
        onClose={() => setModalStatus(null)}
        onConfirm={handleConfirm}
        title="تأكيد التعديل"
        description={
          form.isAdvertising ? (
            <>هل أنت متأكد من رغبتك في تحديث الإعلان؟</>
          ) : (
            <>هل أنت متأكد من رغبتك في تعديل البانر <strong>{form.title}</strong>؟</>
          )
        }
        processingTitle="جارٍ حفظ التغييرات"
        processingDescription="يرجى الانتظار..."
        successTitle="تم الحفظ بنجاح"
        successDescription={`تم تحديث ${form.isAdvertising ? 'الإعلان' : 'البانر'} بنجاح`}
        errorTitle="فشل الحفظ"
        errorDescription={`تعذر تحديث ${form.isAdvertising ? 'الإعلان' : 'البانر'}`}
        errorMessage={errorMessage}
        confirmLabel="تأكيد"
        cancelLabel="إلغاء"
        retryLabel="محاولة مرة أخرى"
      />
    </div>
  );
}