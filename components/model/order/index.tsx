import { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

export type ModalStatus = 'processing' | 'success' | 'error' | null;

 interface StatusModalProps {
  status: ModalStatus;
  onClose: () => void;
  orderId?: string;
  errorMessage?: string;
}

const OrderStatus = ({ status, onClose, orderId, errorMessage }: StatusModalProps) => {
  useEffect(() => {
    if (status === 'success') {
      // Clear cart from localStorage on success
      localStorage.removeItem('cart');
    }
  }, [status]);

  if (!status) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {status !== 'processing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:text-red-600 transition-colors"
          >
            <X color='gray' size={20} />
          </button>
        )}

        <div className="space-y-6 text-center">
          {status === 'processing' && <ProcessingComponent />}
          {status === 'success' && <SuccessComponent orderId={orderId} />}
          {status === 'error' && <ErrorComponent message={errorMessage} />}
        </div>
      </div>
    </div>
  );
};

const ProcessingComponent = () => (
  <>
    <div className="flex justify-center mx-auto mb-4">
    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
    </div>
    <h2 className="text-2xl font-bold text-black mb-2">جار معالجة الطلب</h2>
    <p className="text-gray-600">يرجئ الانتظار اثناء تاكيد طلبك</p>
  </>
);

const SuccessComponent = ({ orderId }: { orderId?: string }) => (
  <>
    <div className="flex justify-center mb-4 text-green-500">
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-black mb-2">تم تقديم الطلب  بنجاح!</h2>
    <p className="text-gray-600 mb-4">
      رقم الطلب: <span className="font-mono text-red-600">{orderId}</span>
    </p>
    <p className="text-black">
      سيتم التواصل معك قريبا للتاكيد طلبك, يمكنك اغلاق النافذة الان
    </p>
  </>
);

const ErrorComponent = ({ message }: { message?: string }) => (
  <>
    <div className="flex justify-center mb-4 text-red-600">
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-black mb-2">فشل في تقديم الطلب</h2>
    <p className="text-gray-600 mb-4">{message || 'حدث خطاء ما. يرجئ المحاولة مرة اخرئ'}</p>
    <button
      onClick={() => window.location.reload()}
      className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
    >
      حاول مجددا
    </button>
  </>
);

export default OrderStatus;