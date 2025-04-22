// app/categories/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '../../components/Button';
import { Input } from '@/components/ui/Input';
import ConfirmationModal from '../../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface CategoryForm {
  name: string;
  type: string;
  image: File | null;
}

type ModalStatus = 'confirming' | 'processing' | 'success' | 'error' | null;

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState<CategoryForm>({
    name: '',
    type: '',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<ModalStatus>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch existing category
  useEffect(() => {
    fetch(`/api/admin/categories/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(({ category }) => {
        setForm({ name: category.name, type: category.type, image: null });
        setOriginalImage(category.image);
        console.log(originalImage)
        setPreviewImage(category.image);
      })
      .catch(err => {
        toast.error(err.message);
        router.back();
      });
  }, [id, router,originalImage]);

  // Update preview when a new file is selected
  useEffect(() => {
    if (form.image) {
      const url = URL.createObjectURL(form.image);
      setPreviewImage(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form.image]);

  const handleChange = (field: keyof Omit<CategoryForm, 'image'>) => (
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
    setModalStatus('confirming');
  };

  const handleConfirm = async () => {
    setModalStatus('processing');
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('type', form.type);
      // only append image if user selected a new one
      if (form.image) data.append('image', form.image);

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update');
      }

      setModalStatus('success');
      setTimeout(() => {
        toast.success('Category updated');
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
        <h1 className="text-3xl font-bold text-slate-800">تعديل الفئة</h1>
        <p className="text-slate-600 mt-2">قم بتعديل بيانات الفئة ثم احفظ التغييرات</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">اسم الفئة بالعربي</label>
          <Input
            title="Category Name *"
            value={form.name}
            onChange={handleChange('name')}
            required
            className='text-gray-700'
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">نوع الفئة بالانجليزي مثال: books</label>
          <Input
            title="Category Type *"
            value={form.type}
            onChange={handleChange('type')}
            required
            className='text-gray-700'
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">صورة الفئة</label>
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
              <p className="text-sm text-gray-700 mb-2">معاينة:</p>
              <Image
              width={160}
              height={160}
                src={previewImage}
                alt="Category preview"
                className="w-32 h-32 object-cover rounded-lg border border-slate-200"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button className='text-gray-900' variant="outline" onClick={() => router.back()} disabled={!!modalStatus}>
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
          <>
            هل أنت متأكد من رغبتك في تعديل الفئة{' '}
            <strong>{form.name}</strong>؟
          </>
        }
        processingTitle="جارٍ حفظ التغييرات"
        processingDescription="يرجى الانتظار..."
        successTitle="تم الحفظ بنجاح"
        successDescription="تم تعديل الفئة بنجاح"
        errorTitle="فشل الحفظ"
        errorDescription="تعذر حفظ التغييرات"
        errorMessage={errorMessage}
        confirmLabel="تأكيد"
        cancelLabel="إلغاء"
        retryLabel="محاولة مرة أخرى"
      />
    </div>
  );
}
