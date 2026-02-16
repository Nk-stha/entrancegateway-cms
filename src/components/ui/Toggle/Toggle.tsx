import type { ToggleProps } from './Toggle.types';

export function Toggle({ label, checked, onChange, id }: ToggleProps) {
  const toggleId = id || `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label className="inline-flex items-center cursor-pointer">
      <span className="text-sm font-bold uppercase tracking-wide mr-3" style={{ color: 'var(--color-brand-navy)' }}>
        {label}
      </span>
      <div className="relative inline-block w-12 h-6">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`
            block w-12 h-6 rounded-full transition-colors cursor-pointer
            ${checked ? '' : 'bg-gray-300'}
          `.replace(/\s+/g, ' ').trim()}
          style={checked ? { backgroundColor: 'var(--color-success)' } : {}}
          onClick={() => onChange(!checked)}
        >
          <div
            className={`
              absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform
              ${checked ? 'translate-x-6' : ''}
            `.replace(/\s+/g, ' ').trim()}
          />
        </div>
      </div>
    </label>
  );
}
