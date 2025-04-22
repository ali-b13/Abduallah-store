// app/banners/create-banner/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/admin-panel/components/Button';
import { Input } from '@/components/ui/Input';
import ConfirmationModal from '@/app/admin-panel/components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { Select } from '@/components/ui/Select';
import { Category } from '@prisma/client';
import Image from 'next/image';

interface BannerForm {
  title: string;
  categoryId: string;
  image: File | null;
  isAdvertising: boolean;
}

type ModalStatus = 'confirming' | 'processing' | 'success' | 'error' | null;

export default function CreateBannerPage() {
  const router = useRouter();
  const [form, setForm] = useState<BannerForm>({
    title: '',
    categoryId:"",
    image: null,
    isAdvertising: false,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [modalStatus, setModalStatus] = useState<ModalStatus>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories');
    try {
      if (res.ok) {
        const data = await res.json();
        const categoriesData = data.categories.map((ct: Category) => ({
          label: ct.name,
          value: ct.id
        }));
        setCategories(categoriesData);
      }
    } catch (error) {
      console.log(error)
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (form.image) {
      const url = URL.createObjectURL(form.image);
      setPreviewImage(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form.image]);

  const handleChange = (field: keyof Omit<BannerForm, 'image' | 'isAdvertising'>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast.error('الصورة مطلوبة');
      return;
    }
    if (!form.isAdvertising && (!form.title)) {
      toast.error('العنوان والرابط مطلوبين');
      return;
    }
    setModalStatus('confirming');
  };

  const handleConfirm = async () => {
    setModalStatus('processing');
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('categoryId', form.categoryId);
      data.append('isAdvertising', form.isAdvertising.toString());
      if (form.image) data.append('image', form.image);

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to create banner');
      }

      setModalStatus('success');
      setTimeout(() => {
        toast.success('تم إنشاء البانر');
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
        <h1 className="text-3xl font-bold text-slate-800">إنشاء بانر جديد</h1>
        <p className="text-slate-600 mt-2">أضف بانر جديد إلى الموقع</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-neutral-600">
            <input
              type="checkbox"
              checked={form.isAdvertising}
              onChange={(e) => setForm(prev => ({ ...prev, isAdvertising: e.target.checked }))}
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
                title="Title *"
                value={form.title}
                onChange={handleChange('title')}
                required={!form.isAdvertising}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-400">ربط الفئة</label>
              <Select
                options={categories}
                value={form.categoryId||""}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required={!form.isAdvertising}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-400">صورة البانر</label>
          <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-indigo-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required
            />
            <div className="text-center">
              <span className="text-slate-500">انقر لتحميل الصورة</span>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF حتى 10 ميجابايت</p>
            </div>
          </label>
          {previewImage && (
            <div className="mt-4">
              <p className="text-sm text-slate-600 mb-2">معاينة:</p>
              <Image
                src={previewImage}
                width={160}
                height={160}
                alt="Banner preview"
                className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-200"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button className='text-slate-800' variant="outline" onClick={() => router.back()} disabled={!!modalStatus}>
            إلغاء
          </Button>
          <Button type="submit" disabled={!!modalStatus}>
            إنشاء البانر
          </Button>
        </div>
      </form>

      <ConfirmationModal
        status={modalStatus}
        onClose={() => setModalStatus(null)}
        onConfirm={handleConfirm}
        title="تأكيد الإنشاء"
        description={
          form.isAdvertising ? (
            <>هل أنت متأكد من رغبتك في إنشاء إعلان جديد؟</>
          ) : (
            <>هل أنت متأكد من رغبتك في إنشاء البانر <strong>{form.title}</strong>؟</>
          )
        }
        processingTitle="جارٍ إنشاء البانر"
        processingDescription="يرجى الانتظار..."
        successTitle="تم الإنشاء بنجاح"
        successDescription={`تم إنشاء ${form.isAdvertising ? 'الإعلان' : 'البانر'} بنجاح`}
        errorTitle="فشل الإنشاء"
        errorDescription={`تعذر إنشاء ${form.isAdvertising ? 'الإعلان' : 'البانر'}`}
        errorMessage={errorMessage}
        confirmLabel="تأكيد"
        cancelLabel="إلغاء"
        retryLabel="محاولة مرة أخرى"
      />
    </div>
  );
}