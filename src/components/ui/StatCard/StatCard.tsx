import type { StatCardProps } from './StatCard.types';

export function StatCard({ title, value, icon, trend, badge }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div 
        className="absolute top-0 right-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: 'var(--color-brand-gold)' }}
      ></div>
      
      <div className="flex items-center justify-between mb-4">
        <span 
          className="p-2 rounded-lg"
          style={{ backgroundColor: 'rgba(13, 71, 161, 0.05)' }}
        >
          <svg 
            className="w-6 h-6"
            style={{ color: 'var(--color-brand-blue)' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {getIconPath(icon)}
          </svg>
        </span>
        
        {trend && (
          <span 
            className="text-xs font-bold flex items-center"
            style={{ 
              color: trend.direction === 'up' 
                ? 'var(--color-success)' 
                : trend.direction === 'down'
                ? 'var(--color-error)'
                : 'var(--color-gray-400)'
            }}
          >
            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {trend.direction === 'up' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              ) : trend.direction === 'down' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              ) : null}
            </svg>
            {trend.value}
          </span>
        )}
        
        {badge && (
          <span 
            className="text-xs font-bold flex items-center"
            style={{ 
              color: badge.variant === 'error' 
                ? 'var(--color-error)' 
                : badge.variant === 'warning'
                ? 'var(--color-warning)'
                : 'var(--color-gray-400)'
            }}
          >
            {badge.variant === 'error' && (
              <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {badge.text}
          </span>
        )}
      </div>
      
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
        {title}
      </p>
      <h3 
        className="text-2xl font-bold mt-1"
        style={{ color: 'var(--color-brand-navy)' }}
      >
        {value}
      </h3>
    </div>
  );
}

function getIconPath(icon: string): React.ReactElement {
  const icons: Record<string, React.ReactElement> = {
    group: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
    assignment: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    pending: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    payments: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
  };
  
  return icons[icon] || icons.group;
}
