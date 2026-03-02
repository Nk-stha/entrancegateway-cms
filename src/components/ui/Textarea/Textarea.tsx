import { forwardRef } from 'react';
import type { TextareaProps } from './Textarea.types';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, helperText, className = '', id, onFocus, onBlur, ...props }, ref) {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : `textarea-${Math.random().toString(36).substr(2, 9)}`);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!error) {
        e.target.style.borderColor = 'var(--color-brand-blue)';
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!error) {
        e.target.style.borderColor = 'var(--color-gray-300)';
      }
      onBlur?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-bold uppercase tracking-wide mb-2"
            style={{ color: 'var(--color-brand-navy)' }}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`
          block w-full px-4 py-2.5 bg-white border-2 rounded-lg
          text-gray-900 transition-colors outline-none resize-y
          ${className}
        `
            .replace(/\s+/g, ' ')
            .trim()}
          style={{
            borderColor: error ? 'var(--color-error)' : 'var(--color-gray-300)',
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {error && (
          <p className="mt-2 text-sm" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}

        {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);
