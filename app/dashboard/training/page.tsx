'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useTrainingFilters } from '@/hooks/useTrainingFilters';
import { useTrainings } from '@/hooks/useTrainings';
import { trainingService } from '@/services/training.service';
import { toast } from '@/lib/utils/toast';
import { useState } from 'react';

export default function TrainingPage() {
  const { filters, updateFilter } = useTrainingFilters();
  const { trainings, loading, error, pagination, goToPage, refetch } = useTrainings({
    page: 0,
    size: 10,
    sortBy: 'trainingStatus',
    sortDir: 'asc',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    const result = await trainingService.deleteTraining(deleteConfirm.id);

    if (result.success) {
      toast.success('Training deleted successfully');
      setDeleteConfirm(null);
      refetch();
    } else {
      toast.error(result.error || 'Failed to delete training');
    }
    setDeleting(false);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      engineering: { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(29, 78, 216)', border: 'rgba(59, 130, 246, 0.2)' },
      medical: { bg: 'rgba(168, 85, 247, 0.1)', text: 'rgb(126, 34, 206)', border: 'rgba(168, 85, 247, 0.2)' },
      it: { bg: 'rgba(156, 163, 175, 0.1)', text: 'rgb(75, 85, 99)', border: 'rgba(156, 163, 175, 0.2)' },
      management: { bg: 'rgba(249, 115, 22, 0.1)', text: 'rgb(194, 65, 12)', border: 'rgba(249, 115, 22, 0.2)' },
    };
    return colors[category as keyof typeof colors] || colors.it;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      registration_open: { 
        bg: 'rgba(46, 125, 50, 0.1)', 
        text: 'var(--color-success)', 
        border: 'rgba(46, 125, 50, 0.2)',
        label: 'REGISTRATION_OPEN'
      },
      upcoming: { 
        bg: 'rgba(249, 168, 37, 0.1)', 
        text: 'var(--color-warning)', 
        border: 'rgba(249, 168, 37, 0.2)',
        label: 'UPCOMING'
      },
      closed: { 
        bg: 'var(--color-gray-100)', 
        text: 'var(--color-gray-600)', 
        border: 'var(--color-gray-200)',
        label: 'CLOSED'
      },
    };
    return configs[status as keyof typeof configs] || configs.closed;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Training Management
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage and monitor all professional training programs.
            </p>
          </div>
          <Link
            href="/dashboard/training/create"
            className="inline-flex items-center justify-center px-4 py-2.5 font-bold rounded-lg transition-colors shadow-sm gap-2"
            style={{
              backgroundColor: 'var(--color-brand-gold)',
              color: 'var(--color-brand-navy)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFD54F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-brand-gold)';
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Create New Training</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow lg:max-w-md">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search trainings by name or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none transition-all"
                style={{ borderColor: 'var(--color-gray-200)' }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-brand-blue)';
                  e.target.style.boxShadow = '0 0 0 1px var(--color-brand-blue)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-gray-200)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="flex flex-wrap gap-4 lg:ml-auto">
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="border-gray-200 rounded-lg text-sm min-w-[160px] outline-none"
                style={{ borderColor: 'var(--color-gray-200)' }}
              >
                <option value="">All Categories</option>
                <option value="engineering">Engineering</option>
                <option value="medical">Medical</option>
                <option value="management">Management</option>
                <option value="it">Information Technology</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="border-gray-200 rounded-lg text-sm min-w-[160px] outline-none"
                style={{ borderColor: 'var(--color-gray-200)' }}
              >
                <option value="">All Statuses</option>
                <option value="registration_open">Registration Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table/Cards */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                <p className="text-gray-500">Loading trainings...</p>
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
          ) : trainings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500">No trainings found</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Training Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Schedule</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Capacity</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Price</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {trainings.map((training, index) => {
                      const categoryColor = getCategoryColor(training.category);
                      const statusConfig = getStatusConfig(training.status);
                      const capacityPercent = (training.capacity.enrolled / training.capacity.total) * 100;

                      return (
                        <tr 
                          key={training.id}
                          className={`hover:bg-gray-50/80 transition-colors group ${index % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                        >
                          <td className="px-6 py-4 font-mono text-gray-500">{training.id}</td>
                          <td className="px-6 py-4">
                            <div 
                              className="font-semibold"
                              style={{ color: 'var(--color-brand-navy)' }}
                            >
                              {training.name}
                            </div>
                            <div className="text-xs text-gray-400">Course Code: {training.courseCode}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              className="px-2.5 py-1 text-xs font-medium rounded-full border uppercase"
                              style={{
                                backgroundColor: categoryColor.bg,
                                color: categoryColor.text,
                                borderColor: categoryColor.border,
                              }}
                            >
                              {training.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">{training.schedule.startDate} - {training.schedule.endDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                              style={{
                                backgroundColor: statusConfig.bg,
                                color: statusConfig.text,
                                borderColor: statusConfig.border,
                              }}
                            >
                              <span 
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: statusConfig.text }}
                              ></span>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="text-gray-900 font-medium">
                                {training.capacity.enrolled}/{training.capacity.total}
                              </div>
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full"
                                  style={{ 
                                    width: `${capacityPercent}%`,
                                    backgroundColor: capacityPercent === 100 ? 'var(--color-gray-600)' : capacityPercent > 0 ? 'var(--color-success)' : 'var(--color-gray-300)'
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            NPR {training.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="p-1.5 text-gray-400 rounded-lg transition-colors hover:bg-gray-100"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <Link
                                href={`/dashboard/training/edit/${training.id}`}
                                className="p-1.5 text-gray-400 rounded-lg transition-colors hover:bg-gray-100"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              <button 
                                onClick={() => handleDeleteClick(training.id, training.name)}
                                className="p-1.5 text-gray-400 rounded-lg transition-colors hover:bg-gray-100"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {trainings.map((training) => {
                  const categoryColor = getCategoryColor(training.category);
                  const statusConfig = getStatusConfig(training.status);
                  const capacityPercent = (training.capacity.enrolled / training.capacity.total) * 100;

                  return (
                    <div key={training.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 
                            className="font-semibold text-base mb-1"
                            style={{ color: 'var(--color-brand-navy)' }}
                          >
                            {training.name}
                          </h3>
                          <p className="text-xs text-gray-400">ID: {training.id} | Code: {training.courseCode}</p>
                        </div>
                        <span 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ml-2"
                          style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                            borderColor: statusConfig.border,
                          }}
                        >
                          <span 
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: statusConfig.text }}
                          ></span>
                          <span className="hidden sm:inline">{statusConfig.label}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Category</p>
                          <span 
                            className="inline-block px-2.5 py-1 text-xs font-medium rounded-full border uppercase"
                            style={{
                              backgroundColor: categoryColor.bg,
                              color: categoryColor.text,
                              borderColor: categoryColor.border,
                            }}
                          >
                            {training.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Price</p>
                          <p className="font-semibold text-gray-900">NPR {training.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Schedule</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{training.schedule.startDate} - {training.schedule.endDate}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-sm font-medium text-gray-900">
                            {training.capacity.enrolled}/{training.capacity.total}
                          </p>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${capacityPercent}%`,
                              backgroundColor: capacityPercent === 100 ? 'var(--color-gray-600)' : capacityPercent > 0 ? 'var(--color-success)' : 'var(--color-gray-300)'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button 
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                          style={{ 
                            color: 'var(--color-brand-blue)',
                            backgroundColor: 'rgba(13, 71, 161, 0.1)'
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <Link
                          href={`/dashboard/training/edit/${training.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                          style={{ 
                            color: 'var(--color-brand-navy)',
                            backgroundColor: 'var(--color-gray-100)'
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(training.id, training.name)}
                          className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                          style={{ 
                            color: 'var(--color-error)',
                            backgroundColor: 'rgba(211, 47, 47, 0.1)'
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && trainings.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
            <div className="text-sm text-gray-500">
              Showing <span className="font-bold" style={{ color: 'var(--color-brand-navy)' }}>{pagination.pageSize}</span> of{' '}
              <span className="font-bold" style={{ color: 'var(--color-brand-navy)' }}>{pagination.totalElements}</span> trainings
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
                      pagination.currentPage === page ? 'z-10' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    style={
                      pagination.currentPage === page
                        ? {
                            borderColor: 'var(--color-brand-blue)',
                            backgroundColor: 'rgba(13, 71, 161, 0.1)',
                            color: 'var(--color-brand-blue)',
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}
                >
                  <svg 
                    className="w-6 h-6" 
                    style={{ color: 'var(--color-error)' }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 
                    className="text-lg font-bold"
                    style={{ color: 'var(--color-brand-navy)' }}
                  >
                    Delete Training
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span>? All associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 font-semibold rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: 'white',
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
