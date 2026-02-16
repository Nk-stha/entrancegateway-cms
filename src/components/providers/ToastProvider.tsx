'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'font-primary',
          title: 'text-sm font-medium',
          description: 'text-sm',
          actionButton: 'bg-trustworthy-blue text-white',
          cancelButton: 'bg-gray-200 text-gray-800',
          closeButton: 'bg-white border-gray-200 hover:bg-gray-100',
          success: 'bg-success text-white border-success',
          error: 'bg-error text-white border-error',
          warning: 'bg-warning text-deep-navy border-warning',
          info: 'bg-trustworthy-blue text-white border-trustworthy-blue',
        },
        style: {
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '1rem',
        },
      }}
    />
  );
}
