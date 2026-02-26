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
    quiz: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    assignment_turned_in: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    trending_up: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
    people: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    check_circle: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  };
  
  return icons[icon] || icons.group;
}
