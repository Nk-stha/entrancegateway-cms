import type { InputProps } from './Input.types';

export function Input({
  label,
  error,
  icon,
  helperText,
  labelAction,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full">
      {label && (
        <div className={`flex items-center ${labelAction ? 'justify-between' : ''} mb-2`}>
          <label
            htmlFor={inputId}
            className="block text-sm font-bold uppercase tracking-wide"
            style={{ 
              color: 'var(--color-brand-navy)',
              fontFamily: 'var(--font-primary)'
            }}
          >
            {label}
          </label>
          {labelAction && labelAction}
        </div>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          className={`
            block w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5
            bg-white border-2 rounded-xl text-gray-900 placeholder-gray-400
            transition-colors outline-none font-sans
            ${className}
          `.replace(/\s+/g, ' ').trim()}
          style={{
            borderColor: error ? 'var(--color-error)' : 'var(--color-gray-200)'
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--color-brand-blue)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--color-gray-200)';
            }
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`} 
          className="mt-2 text-sm" 
          style={{ color: 'var(--color-error)' }}
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
