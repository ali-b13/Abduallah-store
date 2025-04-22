"use client";

import { Button } from '@/components/ui/Button';
import Register from './Register';
import Login from './Login';
import { AuthModal } from './authModel';
import { useAuthModel } from '@/context/useAuth';

export default function AuthController({title}:{title:string}) {
   const {isOpen,onClose,onOpen,isLogin,setIsLogin}= useAuthModel()

  return (
    <div className="flex flex-col md:flex-row gap-4 ">
      <Button 
      className='w-1/3 md:w-full text-xs'
      onClick={() => {
        setIsLogin(true);
        onOpen();
      }}>
        <span className='text-center'>{title}</span>
      </Button>

      <AuthModal
        isOpen={isOpen}
        onClose={() => onClose()}
        title={isLogin ? 'مرحبا بك من جديد' : 'انشاء حساب'}
      >
        {isLogin ? (
          <Login 
            onSwitchToRegister={() => setIsLogin(false)}
            onClose={onClose}
          />
        ) : (
          <Register
          onClose={onClose}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </AuthModal>
    </div>
  );
}