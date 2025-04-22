import { Button } from '@/components/ui/Button';
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from '@/lib/security/input-sanitizer';
import { signIn } from "next-auth/react";
import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

type FormData = z.infer<typeof loginSchema>;

interface LoginProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

const Login = ({ onSwitchToRegister, onClose }: LoginProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema)
  });

  const handleLogin = async (data: FormData) => {
    setIsLoading(true);
    setServerError(null);

    const result = await signIn("credentials", {
      redirect: false,
      ...data
    });

    setIsLoading(false);

    if (result?.error) {
      setServerError("رقم الهاتف او كلمة المرور غير صحيحة");
      return;
    }

    if (result?.ok) {
      setIsSuccess(true);
      // Auto-close after 2 seconds if needed
      // setTimeout(onClose, 2000);
    }
  };

  

  if (isSuccess) {
    return (
      <div className="text-center p-6 space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <p className="text-xl font-semibold">تم تسجيل الدخول بنجاح!</p>
        <Button
          onClick={onClose}
          className="w-full bg-primary hover:bg-red-900 text-white"
        >
          متابعة
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
      <div className="space-y-4">
        <input
          type="number"
          {...register("mobile")}
          placeholder="رقم الهاتف : مثال (715000001)"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          disabled={isLoading}
        />
        {errors.mobile && <span className='text-red-500'>{errors.mobile.message}</span>}

        <input
          type="password"
          {...register("password")}
          placeholder="كلمه المرور"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          disabled={isLoading}
        />
        {errors.password && <span className='text-red-500'>{errors.password.message}</span>}
        {serverError && <span className='text-red-500 block text-center'>{serverError}</span>}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-red-900 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className='flex items-center gap-2 justify-center'>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
           <span> جاري تسجيل الدخول...</span>
          </div>
        ) : 'تسجيل'}
      </Button>


      <p className="text-center text-sm text-gray-500">
        ليس لديك حساب?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:underline font-medium"
          disabled={isLoading}
        >
          انشاء حساب جديد
        </button>
      </p>
    </form>
  );
};

export default Login;