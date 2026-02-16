'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useEnrollmentFilters } from '@/hooks/useEnrollmentFilters';
import { useEnrollments } from '@/hooks/useEnrollments';

export default function EnrollmentsPage() {
  const router = useRouter();
  const { filters, updateFilter } = useEnrollmentFilters();
  const { enrollments, loading, error, pagination, goToPage } = useEnrollments({
    page: 0,
    size: 10,
    sortBy: 'enrollmentDate',
    sortDir: 'desc',
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      active: {
        bg: 'rgba(46, 125, 50, 0.1)',
        text: 'var(--color-success)',
        border: 'rgba(46, 125, 50, 0.2)',
        label: 'ACTIVE',
      },
      pending: {
        bg: 'rgba(249, 168, 37, 0.1)',
        text: 'var(--color-warning)',
        border: 'rgba(249, 168, 37, 0.2)',
        label: 'PENDING',
      },
      completed: {
        bg: 'rgba(13, 71, 161, 0.1)',
        text: 'var(--color-brand-blue)',
        border: 'rgba(13, 71, 161, 0.2)',
        label: 'COMPLETED',
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getInitialsColor = (initials: string) => {
    const colors = [
      { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(29, 78, 216)' },
      { bg: 'rgba(249, 168, 37, 0.1)', text: 'rgb(194, 120, 3)' },
      { bg: 'rgba(46, 125, 50, 0.1)', text: 'rgb(27, 94, 32)' },
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Training Enrollments
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage student admissions and training program registrations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={filters.dateRange}
                readOnly
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer outline-none"
                placeholder="Filter by Date Range"
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-brand-blue)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-gray-300)';
                }}
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export to CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 relative">
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search by Student Name or ID..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none transition-all"
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = 'var(--color-brand-blue)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'var(--color-gray-50)';
                  e.target.style.borderColor = 'var(--color-gray-200)';
                }}
              />
            </div>

            {/* Training Program */}
            <select
              value={filters.trainingProgram}
              onChange={(e) => updateFilter('trainingProgram', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg text-sm py-2 px-3 outline-none"
            >
              <option value="">Training Program</option>
              <option value="full-stack">Full Stack Java Development</option>
              <option value="ui-ux">UI/UX Design Masterclass</option>
              <option value="devops">DevOps Certification</option>
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg text-sm py-2 px-3 outline-none"
            >
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table/Cards */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                <p className="text-gray-500">Loading enrollments...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">{error}</p>
              </div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500">No enrollments found</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: 'var(--color-brand-navy)' }}>
                        ID
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-navy)' }}>
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-navy)' }}>
                        Training Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-navy)' }}>
                        Progress
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-navy)' }}>
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-navy)' }}>
                        Paid Amount
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-navy)' }}>
                        Enrollment Date
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: 'var(--color-brand-navy)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrollments.map((enrollment, index) => {
                      const statusConfig = getStatusConfig(enrollment.status);
                      const initialsColor = getInitialsColor(enrollment.studentInitials);

                      return (
                        <tr
                          key={enrollment.id}
                          onClick={() => router.push(`/dashboard/enrollments/${enrollment.id}`)}
                          className={`hover:bg-gray-50/80 transition-colors group cursor-pointer ${
                            index % 2 === 1 ? 'bg-gray-50/30' : ''
                          }`}
                        >
                          <td className="px-6 py-4 text-right font-mono font-bold text-gray-400">
                            #{enrollment.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                                style={{
                                  backgroundColor: initialsColor.bg,
                                  color: initialsColor.text,
                                }}
                              >
                                {enrollment.studentInitials}
                              </div>
                              <span className="font-medium text-gray-900">{enrollment.studentName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{enrollment.trainingName}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 w-48">
                              <div className="flex-grow bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${enrollment.progress}%`,
                                    backgroundColor:
                                      enrollment.progress === 100
                                        ? 'var(--color-success)'
                                        : 'var(--color-brand-blue)',
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-500 min-w-[35px]">
                                {enrollment.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider border"
                              style={{
                                backgroundColor: statusConfig.bg,
                                color: statusConfig.text,
                                borderColor: statusConfig.border,
                              }}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">
                                NPR {enrollment.paidAmount.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5 group relative cursor-help">
                                <span className="text-[10px] text-gray-400 font-medium uppercase">
                                  {enrollment.paymentMethod}
                                </span>
                                <svg
                                  className="w-3.5 h-3.5"
                                  style={{
                                    color: enrollment.paymentVerified
                                      ? 'var(--color-success)'
                                      : 'var(--color-gray-300)',
                                  }}
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{enrollment.enrollmentDate}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-1.5 text-gray-400 rounded-lg transition-colors hover:bg-gray-100"
                                title="View Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/enrollments/${enrollment.id}`);
                                }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {enrollments.map((enrollment) => {
                  const statusConfig = getStatusConfig(enrollment.status);
                  const initialsColor = getInitialsColor(enrollment.studentInitials);

                  return (
                    <div 
                      key={enrollment.id} 
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/enrollments/${enrollment.id}`)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                            style={{
                              backgroundColor: initialsColor.bg,
                              color: initialsColor.text,
                            }}
                          >
                            {enrollment.studentInitials}
                          </div>
                          <div>
                            <h3 className="font-semibold text-base" style={{ color: 'var(--color-brand-navy)' }}>
                              {enrollment.studentName}
                            </h3>
                            <p className="text-xs text-gray-400">ID: #{enrollment.id}</p>
                          </div>
                        </div>
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border uppercase ml-2"
                          style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                            borderColor: statusConfig.border,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Training Name */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Training</p>
                        <p className="text-sm text-gray-900 font-medium">{enrollment.trainingName}</p>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-500">Progress</p>
                          <p className="text-xs font-semibold text-gray-500">{enrollment.progress}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${enrollment.progress}%`,
                              backgroundColor:
                                enrollment.progress === 100 ? 'var(--color-success)' : 'var(--color-brand-blue)',
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Payment & Date */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Payment</p>
                          <p className="font-bold text-gray-900 text-sm">NPR {enrollment.paidAmount.toLocaleString()}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-medium uppercase">
                              {enrollment.paymentMethod}
                            </span>
                            <svg
                              className="w-3 h-3"
                              style={{
                                color: enrollment.paymentVerified ? 'var(--color-success)' : 'var(--color-gray-300)',
                              }}
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Enrolled</p>
                          <p className="text-sm text-gray-600">{enrollment.enrollmentDate}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && enrollments.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
            <div className="text-sm text-gray-500">
              Showing <span className="font-bold" style={{ color: 'var(--color-brand-navy)' }}>{pagination.pageSize}</span> of{' '}
              <span className="font-bold" style={{ color: 'var(--color-brand-navy)' }}>{pagination.totalElements}</span> enrollments
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
              <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => goToPage(Math.max(0, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => i).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.currentPage === page ? 'z-10 font-bold' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    style={
                      pagination.currentPage === page
                        ? {
                            borderColor: 'var(--color-brand-blue)',
                            backgroundColor: 'var(--color-brand-navy)',
                            color: 'white',
                          }
                        : { borderColor: 'var(--color-gray-300)' }
                    }
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                  disabled={pagination.isLast}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
