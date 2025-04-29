'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';
import { Input } from '@/components/ui/Input';
import ConfirmationModal from '../../components/ConfirmModal';
import ImageUpload from '../../components/ImageUploader';

interface CategoryForm {
  name: string;
  type: string;
  image: string;
}

type ModalStatus = 'confirming' | 'processing' | 'success' | 'error' | null;

export default function CreateCategoryPage() {
  const router = useRouter();
  const [modalStatus, setModalStatus] = useState<ModalStatus>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [form, setForm] = useState<CategoryForm>({
    name: '',
    type: '',
    image: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (field: keyof Omit<CategoryForm, 'image'>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalStatus('confirming');
  };

  const handleConfirm = async () => {
    setModalStatus('processing');
    
    try {
      const categoryData = {
        ...form,
        image: imageUrls[0] || '' // Use first image URL
      };

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!res.ok) throw new Error('حدث خطاء غير متوقع, حاول مجددا');

      setModalStatus('success');
      setTimeout(() => router.push('/admin-panel/categories'), 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setErrorMessage(errorMessage);
      setModalStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-right">
        <h1 className="text-3xl font-bold text-gray-900">إنشاء فئة جديدة</h1>
        <p className="text-slate-600 mt-2">أضف فئة منتج جديدة إلى متجرك</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">اسم الفئة بالعربي</label>
            <Input
              value={form.name}
              onChange={handleChange('name')}
              required
              className="focus:ring-2 focus:ring-indigo-500 text-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">نوع الفئة بالانجليزي مثال: books</label>
            <Input
              value={form.type}
              onChange={handleChange('type')}
              required
              className="focus:ring-2 focus:ring-indigo-500 text-gray-700"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">صورة الفئة</label>
            <ImageUpload
              values={imageUrls}
              setImageUrls={setImageUrls}
              maxFiles={1}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={!!modalStatus}
            className="px-6 py-2.5 border-slate-300 hover:bg-slate-50 text-gray-700"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={!!modalStatus}
            className="px-6 py-2.5 bg-primary hover:bg-red-700 text-white shadow-sm"
          >
            إنشاء الفئة
          </Button>
        </div>
      </form>

      <ConfirmationModal
        status={modalStatus}
        onClose={() => setModalStatus(null)}
        onConfirm={handleConfirm}
        title="إنشاء فئة جديدة"
        description={
          <>
            هل أنت متأكد من رغبتك في إنشاء الفئة{' '}
            <strong>{form.name}</strong>؟ سيتم تطبيق هذا الإجراء فورًا.
          </>
        }
        processingTitle="جاري إنشاء الفئة"
        processingDescription="يرجى الانتظار أثناء عملية الإنشاء"
        successTitle="تم الإنشاء بنجاح"
        successDescription="تم إنشاء الفئة الجديدة بنجاح"
        errorTitle="فشل الإنشاء"
        errorDescription="تعذر إنشاء الفئة الجديدة"
        errorMessage={errorMessage}
        confirmLabel="تأكيد الإنشاء"
        cancelLabel="إلغاء"
        retryLabel="محاولة مرة أخرى"
      />
    </div>
  );
}