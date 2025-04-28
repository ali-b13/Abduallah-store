import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from '@/lib/security/input-sanitizer';
import { z } from "zod";
import { Button } from '@/components/ui/Button';

type FormData = z.infer<typeof signUpSchema>;

interface RegisterProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

const Register = ({ onSwitchToLogin }: RegisterProps) => {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    trigger 
  } = useForm<FormData>({
    resolver: zodResolver(signUpSchema)
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError('');

    // Validate fields before submission
    const isValid = await trigger();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          confirmPassword:data.confirmPassword,
          password: data.password,
          mobile:data.mobile
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      if (result.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isSuccess ? (
        <div className="text-center p-6 space-y-4">
          <div className="text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-semibold">تم إنشاء الحساب بنجاح!</p>
          <Button 
            onClick={onSwitchToLogin}
            className="w-full bg-primary hover:bg-red-900 text-white"
          >
            متابعة
          </Button>
        </div>
      ) : (
        <div  className='flex flex-col gap-2 items-center'>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              {...register("name")}
              placeholder="الاسم كامل"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-700"
            />
            {errors.name && <span className='text-red-500'>{errors.name.message}</span>}
            <input
              type="text"
              {...register("mobile")}
              placeholder="رقم الهاتف"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-700"
            />
            {errors.mobile && <span className='text-red-500'>{errors.mobile.message}</span>}


            <input
              type="password"
              {...register("password")}
              placeholder="كلمه المرور"
              className="text-slate-700 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            {errors.password && <span className='text-red-500'>{errors.password.message}</span>}

            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="تأكيد كلمة المرور"
              className="text-slate-700 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            {errors.confirmPassword && <span className='text-red-500'>{errors.confirmPassword.message}</span>}

            {serverError && <span className='text-red-500 mt-4 block text-center'>{serverError}</span>}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-red-900 text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'انشاء حساب جديد'}
          </Button>
          
          <p className="text-center text-sm text-gray-500">
            لديك حساب مسبقا?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:underline font-medium"
              disabled={loading}
            >
              سجل الدخول
            </button>
          </p>
        </form>
        </div>
      )}
    </>
  );
};

export default Register;