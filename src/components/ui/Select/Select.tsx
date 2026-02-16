import type { SelectProps } from './Select.types';

export function Select({
  label,
  error,
  helperText,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-bold uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-brand-navy)' }}
        >
          {label}
        </label>
      )}
      
      <select
        id={selectId}
        className={`
          block w-full px-4 py-2.5 bg-white border-2 rounded-lg
          text-gray-900 transition-colors outline-none
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
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
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
