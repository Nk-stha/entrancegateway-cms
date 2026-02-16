'use client';

import { toast } from '@/lib/utils/toast';

export function ToastDemo() {
  const showSuccessToast = () => {
    toast.success('Operation completed successfully!', {
      description: 'Your changes have been saved.',
    });
  };

  const showErrorToast = () => {
    toast.error('Something went wrong!', {
      description: 'Please try again or contact support.',
    });
  };

  const showWarningToast = () => {
    toast.warning('Please review your input', {
      description: 'Some fields require your attention.',
    });
  };

  const showInfoToast = () => {
    toast.info('New update available', {
      description: 'Click here to learn more about the latest features.',
    });
  };

  const showToastWithAction = () => {
    toast.error('Failed to delete item', {
      description: 'The item could not be deleted.',
      action: {
        label: 'Retry',
        onClick: () => {
          console.log('Retry clicked');
          toast.success('Retry initiated');
        },
      },
    });
  };

  const showPromiseToast = () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve({ name: 'John' }) : reject('Failed');
      }, 2000);
    });

    toast.promise(promise, {
      loading: 'Loading data...',
      success: 'Data loaded successfully!',
      error: 'Failed to load data',
    });
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-deep-navy mb-6">Toast Notifications Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={showSuccessToast}
          className="btn btn-primary"
        >
          Show Success Toast
        </button>

        <button
          onClick={showErrorToast}
          className="btn bg-error text-white hover:opacity-90"
        >
          Show Error Toast
        </button>

        <button
          onClick={showWarningToast}
          className="btn bg-warning text-deep-navy hover:opacity-90"
        >
          Show Warning Toast
        </button>

        <button
          onClick={showInfoToast}
          className="btn btn-secondary"
        >
          Show Info Toast
        </button>

        <button
          onClick={showToastWithAction}
          className="btn btn-tertiary"
        >
          Toast with Action
        </button>

        <button
          onClick={showPromiseToast}
          className="btn bg-academic-gold text-deep-navy hover:opacity-90"
        >
          Promise Toast
        </button>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Usage Example:</h3>
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
{`import { toast } from '@/lib/utils/toast';

// Success toast
toast.success('Operation completed!', {
  description: 'Your changes have been saved.'
});

// Error toast
toast.error('Something went wrong!', {
  description: 'Please try again.'
});

// Warning toast
toast.warning('Please review your input');

// Info toast
toast.info('New update available');

// Toast with action button
toast.error('Failed to delete', {
  action: {
    label: 'Retry',
    onClick: () => console.log('Retry')
  }
});

// Promise toast
toast.promise(fetchData(), {
  loading: 'Loading...',
  success: 'Data loaded!',
  error: 'Failed to load'
});`}
        </pre>
      </div>
    </div>
  );
}
