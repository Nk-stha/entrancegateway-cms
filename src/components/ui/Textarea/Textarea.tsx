import type { TextareaProps } from './Textarea.types';

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

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
        id={textareaId}
        className={`
          block w-full px-4 py-2.5 bg-white border-2 rounded-lg
          text-gray-900 transition-colors outline-none resize-y
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        style={{
          borderColor: error ? 'var(--color-error)' : 'var(--color-gray-300)'
        }}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = 'var(--color-brand-blue)';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = 'var(--color-gray-300)';
          }
        }}
        {...props}
      />
      
      {error && (
        <p 
          className="mt-2 text-sm" 
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
