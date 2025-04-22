'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';
import { Input } from '@/components/ui/Input';
import ConfirmationModal from '../../components/ConfirmModal';
import Image from 'next/image';

interface CategoryForm {
    name: string;
    type: string;
    image: File | null;
}

type ModalStatus = 'confirming' | 'processing' | 'success' | 'error' | null;

export default function CreateCategoryPage() {
    const router = useRouter();
    const [modalStatus, setModalStatus] = useState<ModalStatus>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [form, setForm] = useState<CategoryForm>({
        name: '',
        type: '',
        image: null,
    });
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (form.image) {
            const objectUrl = URL.createObjectURL(form.image);
            setPreviewImage(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
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
            if (form.image) data.append('image', form.image);

            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                body: data,
            });

            if (!res.ok) throw new Error('حدث خطاء غير متوقع,حاول مجددا');

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
                <h1 className="text-3xl font-bold text-slate-800">إنشاء فئة جديدة</h1>
                <p className="text-slate-600 mt-2">أضف فئة منتج جديدة إلى متجرك</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">

                <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-400">  اسم الفئة بالعربي</label>
                    <Input
                        title="Category Name *"
                        value={form.name}
                        onChange={handleChange('name')}
                        required
                        className="focus:ring-2 focus:ring-indigo-500"
                    />
                    </div>
                
                    <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-400">نوع الفئة بالانجليزي مثال : books</label>
                    <Input
                        title="Category Type "
                        value={form.type}
                        onChange={handleChange('type')}
                        required
                        className="focus:ring-2 focus:ring-indigo-500"
                    />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-400">صورة الفئة</label>
                        <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer border-slate-300 hover:border-indigo-500 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <div className="text-center">
                                <span className="text-slate-500">انقر للتحميل الصورة</span>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF حتى 10 ميجابايت</p>
                            </div>
                        </label>
                        {previewImage && (
                            <div className="mt-4">
                                <p className="text-sm text-slate-600 mb-2"> معاينة:</p>
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
                </div>
                <div className="flex justify-end gap-4 pt-6">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={!!modalStatus}
                        className="px-6 py-2.5 border-slate-300 hover:bg-slate-50"
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