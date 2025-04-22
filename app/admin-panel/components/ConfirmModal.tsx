'use client';

import { Loader2, X } from 'lucide-react';
import Button from '../components/Button';

export type ModalStatus = 'confirming' | 'processing' | 'success' | 'error' | null;

interface ConfirmationModalProps {
  status: ModalStatus;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  processingTitle?: string;
  processingDescription?: string;
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  errorMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  retryLabel?: string;
  // Optional custom icon components for each status
  confirmingIcon?: React.ReactNode;
  processingIcon?: React.ReactNode;
  successIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
}

const ConfirmationModal = ({
  status,
  onClose,
  onConfirm,
  title = 'تاكيد الفعل',
  description = 'هل انت متاكد من القيام بهاذا الفعل ؟',
  processingTitle = 'معالجة العملية',
  processingDescription = 'انتظر من فضلك , يتم الان معالجة الطلب',
  successTitle = 'تم بنجاح',
  successDescription = 'العملية  تمت بنجاح ',
  errorTitle = 'خطاء',
  errorDescription = 'حدث خطاء اثنا اتمام الطلب.',
  errorMessage,
  confirmLabel = 'تاكيد',
  cancelLabel = 'الغاء',
  retryLabel = 'حاول مجددا',
  confirmingIcon,
  processingIcon,
  successIcon,
  errorIcon,
}: ConfirmationModalProps) => {
  if (!status) return null;

  // Default icons can be set if not provided
  const defaultConfirmIcon = (
    <svg className="w-12 h-12 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H8V5a2 2 0 012-2z" />
    </svg>
  );

  const defaultProcessingIcon = (
    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
  );

  const defaultSuccessIcon = (
    <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const defaultErrorIcon = (
    <svg className="w-16 h-16 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8  max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-red-600 transition-colors"
          disabled={status === 'processing'}
        >
          <X color="gray" size={20} />
        </button>

        <div className="space-y-6 text-center">
          {status === 'confirming' && (
            <>
              <div className="mb-4">
                {confirmingIcon || defaultConfirmIcon}
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
              <p className="text-gray-600">{description}</p>
              <div className="flex justify-center gap-4 mt-6">
                <Button variant="outline" onClick={onClose} className="px-6">
                  {cancelLabel}
                </Button>
                <Button variant="destructive" onClick={onConfirm} className="px-6">
                  {confirmLabel}
                </Button>
              </div>
            </>
          )}

          {status === 'processing' && (
            <>
              <div className="mb-4">
                {processingIcon || defaultProcessingIcon}
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">{processingTitle}</h2>
              <p className="text-gray-600">{processingDescription}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4">
                {successIcon || defaultSuccessIcon}
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">{successTitle}</h2>
              <p className="text-gray-600">{successDescription}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                {errorIcon || defaultErrorIcon}
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">{errorTitle}</h2>
              <p className="text-gray-600 mb-4">{errorDescription} {errorMessage && <span>{errorMessage}</span>}</p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={onClose}>
                  {cancelLabel}
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                  {retryLabel}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
