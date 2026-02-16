import type { CheckboxProps } from './Checkbox.types';

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const checkboxId = id || `checkbox-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={checkboxId}
        className={`h-5 w-5 border-gray-300 rounded-md transition-all cursor-pointer ${className}`}
        style={{
          accentColor: 'var(--color-brand-blue)'
        }}
        {...props}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className="ml-3 block text-sm font-medium text-gray-600 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
}
