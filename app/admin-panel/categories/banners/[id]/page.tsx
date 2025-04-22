'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/app/admin-panel/components/Button';
import { Input } from '@/components/ui/Input';
import ConfirmationModal from '@/app/admin-panel/components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { Select } from '@/components/ui/Select';
import { Category } from '@prisma/client';
import Image from 'next/image';

interface BannerForm {
  title: string;
  categoryId:string;
  image: File | null;
  isAdvertising: boolean;
}

type ModalStatus = 'confirming' | 'processing' | 'success' | 'error' | null;

export default function EditBannerPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState<BannerForm>({
    title: '',
    image: null,
    categoryId:"",
    isAdvertising: false,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string>('');
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
          title: banner.title,
          image: null,
          categoryId:banner.categoryId,
          isAdvertising: banner.isAdvertising
        });
        setOriginalImage(banner.image);
        setPreviewImage(banner.image);
      })
      .catch(err => {
        toast.error(err.message);
        router.back();
      });
  }, [id, router]);

  useEffect(() => {
    if (form.image) {
      const url = URL.createObjectURL(form.image);
      setPreviewImage(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form.image]);

  const handleChange = (field: keyof Omit<BannerForm, 'image' | 'isAdvertising'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    if (!form.image && !originalImage) {
      toast.error('الصورة مطلوبة');
      return;
    }
    if (!form.isAdvertising && (!form.title )) {
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

      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        body: data,
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

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-neutral-600">
            <input
              type="checkbox"
              checked={form.isAdvertising}
              onChange={(e) => setForm(prev => ({ 
                ...prev, 
                isAdvertising: e.target.checked,
                ...(e.target.checked && { title: '', link: '' })
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
                title="Title *"
                value={form.title || ""}
                onChange={handleChange('title')}
                required={!form.isAdvertising}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-400">ربط الفئة</label>
              <Select
                options={categories}
                value={form.categoryId||""} 
                onChange={(e) => setForm({...form, categoryId: e.target.value})}
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
            />
            <div className="text-center">
              <span className="text-slate-500">انقر لتحميل صورة جديدة</span>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF حتى 10 ميجابايت</p>
            </div>
          </label>
          {previewImage && (
            <div className="mt-4">
              <p className="text-sm text-slate-600 mb-2">معاينة:</p>
              <Image
              width={160}
              height={160}
                src={previewImage}
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