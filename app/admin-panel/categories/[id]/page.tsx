'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '../../components/Button';
import { Input } from '@/components/ui/Input';
import ConfirmationModal from '../../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import ImageUpload from '../../components/ImageUploader';

interface CategoryForm {
  name: string;
  type: string;
  image: string;
}

type ModalStatus = 'confirming' | 'processing' | 'success' | 'error' | null;

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [form, setForm] = useState<CategoryForm>({
    name: '',
    type: '',
    image: '',
  });
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
        setForm({
          name: category.name,
          type: category.type,
          image: category.image
        });
        setImageUrls([category.image]);
      })
      .catch(err => {
        toast.error(err.message);
        router.back();
      });
  }, [id, router]);

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
      const updatedData = {
        ...form,
        image: imageUrls[0] || '' // Use first image URL
      };

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update');
      }

      setModalStatus('success');
      setTimeout(() => {
        toast.success('تم تحديث الفئة بنجاح');
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
            value={form.name}
            onChange={handleChange('name')}
            required
            className='text-gray-700'
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">نوع الفئة بالانجليزي مثال : books</label>
          <Input
            value={form.type}
            onChange={handleChange('type')}
            required
            className='text-gray-700'
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

        <div className="flex justify-end gap-4 pt-6">
          <Button className='text-gray-900' variant="outline" 
                  onClick={() => router.back()} 
                  disabled={!!modalStatus}>
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