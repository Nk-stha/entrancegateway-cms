import type { EmptyStateProps } from './EmptyState.types';

export function EmptyState({ type, message, action }: EmptyStateProps) {
  if (type === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4"
            style={{ borderColor: 'var(--color-brand-blue)' }}
          ></div>
          <p className="text-gray-500">{message || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: 'var(--color-error)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500 mb-4">{message || 'Something went wrong'}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 font-semibold rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--color-brand-blue)',
                color: 'white',
              }}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-500 mb-4">{message || 'No data available'}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 font-semibold rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-brand-blue)',
              color: 'white',
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
