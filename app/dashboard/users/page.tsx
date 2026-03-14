'use client';

import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useUsers } from '@/hooks/useUsers';
import { userService } from '@/services/user.service';
import { toast } from '@/lib/utils/toast';
import { useState } from 'react';
import type { UserDetailApiResponse } from '@/types/user.types';

export default function UsersPage() {
  const { users, loading, error, pagination, goToPage } = useUsers({
    page: 0,
    size: 10,
    sortBy: 'fullname',
    sortDir: 'asc',
  });
  const [viewUser, setViewUser] = useState<UserDetailApiResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'enrollments' | 'purchases' | 'quizzes' | 'admissions'>('info');

  const handleViewClick = async (id: number) => {
    setLoadingUserId(id);
    setLoadingDetail(true);
    setViewUser(null);
    
    try {
      const user = await userService.getUserById(id);
      
      if (user) {
        setViewUser(user);
      } else {
        toast.error('Failed to load user details. Please try again.');
        setLoadingUserId(null);
      }
    } catch (error) {
      const apiError = error instanceof Error ? error : new Error('Unknown error');
      console.error('Error loading user details:', apiError.message);
      toast.error('An unexpected error occurred while loading user details.');
      setLoadingUserId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      SUPER_ADMIN: { bg: 'rgba(211, 47, 47, 0.1)', text: 'var(--color-error)', border: 'rgba(211, 47, 47, 0.2)' },
      ADMIN: { bg: 'rgba(249, 168, 37, 0.1)', text: 'var(--color-warning)', border: 'rgba(249, 168, 37, 0.2)' },
      USER: { bg: 'rgba(13, 71, 161, 0.1)', text: 'var(--color-brand-blue)', border: 'rgba(13, 71, 161, 0.2)' },
    };
    return colors[role as keyof typeof colors] || colors.USER;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              User Management
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage and monitor all registered users.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                <p className="text-gray-500">Loading users...</p>
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
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-500">No users found</p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Email</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Address</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {users.map((user, index) => {
                      const roleColor = getRoleBadgeColor(user.role);
                      const isLoadingThisUser = loadingUserId === user.id;

                      return (
                        <tr 
                          key={user.id}
                          onClick={() => !isLoadingThisUser && handleViewClick(user.id)}
                          className={`transition-colors ${isLoadingThisUser ? 'cursor-wait opacity-60' : 'cursor-pointer hover:bg-gray-50/80'} ${index % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                        >
                          <td className="px-6 py-4 font-mono text-gray-500">
                            {isLoadingThisUser ? (
                              <div className="flex items-center gap-2">
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                                <span>{user.id}</span>
                              </div>
                            ) : (
                              user.id
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div 
                              className="font-semibold"
                              style={{ color: 'var(--color-brand-navy)' }}
                            >
                              {user.fullname}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 text-gray-600">{user.contact}</td>
                          <td className="px-6 py-4 text-gray-600">{user.address}</td>
                          <td className="px-6 py-4">
                            <span 
                              className="px-2.5 py-1 text-xs font-medium rounded-full border"
                              style={{
                                backgroundColor: roleColor.bg,
                                color: roleColor.text,
                                borderColor: roleColor.border,
                              }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {user.isVerified ? (
                              <span 
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                                style={{
                                  backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                  color: 'var(--color-success)',
                                  borderColor: 'rgba(46, 125, 50, 0.2)',
                                }}
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <span 
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                                style={{
                                  backgroundColor: 'var(--color-gray-100)',
                                  color: 'var(--color-gray-600)',
                                  borderColor: 'var(--color-gray-200)',
                                }}
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Unverified
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y divide-gray-200">
                {users.map((user) => {
                  const roleColor = getRoleBadgeColor(user.role);
                  const isLoadingThisUser = loadingUserId === user.id;

                  return (
                    <div 
                      key={user.id} 
                      onClick={() => !isLoadingThisUser && handleViewClick(user.id)}
                      className={`p-4 transition-colors ${isLoadingThisUser ? 'cursor-wait opacity-60 bg-gray-100' : 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-base mb-1 truncate flex items-center gap-2"
                            style={{ color: 'var(--color-brand-navy)' }}
                          >
                            {isLoadingThisUser && (
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 flex-shrink-0" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                            )}
                            {user.fullname}
                          </h3>
                          <p className="text-xs text-gray-400">ID: {user.id}</p>
                        </div>
                        <span 
                          className="px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap flex-shrink-0"
                          style={{
                            backgroundColor: roleColor.bg,
                            color: roleColor.text,
                            borderColor: roleColor.border,
                          }}
                        >
                          {user.role}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate flex-1 break-all">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="truncate flex-1">{user.contact}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate flex-1">{user.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-medium">Status</span>
                        {user.isVerified ? (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                            style={{
                              backgroundColor: 'rgba(46, 125, 50, 0.1)',
                              color: 'var(--color-success)',
                              borderColor: 'rgba(46, 125, 50, 0.2)',
                            }}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                            style={{
                              backgroundColor: 'var(--color-gray-100)',
                              color: 'var(--color-gray-600)',
                              borderColor: 'var(--color-gray-200)',
                            }}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Unverified
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Tap to view details
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {!error && users.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
            {loading ? (
              <div className="flex items-center justify-center w-full py-4">
                <div className="flex items-center gap-3">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-500">
                  Showing <span className="font-bold" style={{ color: 'var(--color-brand-navy)' }}>{pagination.pageSize}</span> of{' '}
                  <span className="font-bold" style={{ color: 'var(--color-brand-navy)' }}>{pagination.totalElements}</span> users
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
                    {(() => {
                      const maxPages = 5;
                      const current = pagination.currentPage;
                      const total = pagination.totalPages;
                      
                      let startPage = Math.max(0, current - Math.floor(maxPages / 2));
                      let endPage = Math.min(total, startPage + maxPages);
                      
                      if (endPage - startPage < maxPages) {
                        startPage = Math.max(0, endPage - maxPages);
                      }
                      
                      return Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map((page) => {
                        const isActive = pagination.currentPage === page;
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                              isActive ? 'z-10' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            style={
                              isActive
                                ? {
                                    borderColor: 'var(--color-brand-blue)',
                                    backgroundColor: 'rgba(13, 71, 161, 0.1)',
                                    color: 'var(--color-brand-blue)',
                                  }
                                : undefined
                            }
                          >
                            {page + 1}
                          </button>
                        );
                      });
                    })()}
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
              </>
            )}
          </div>
        )}

        {viewUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h3 
                  className="text-xl font-bold"
                  style={{ color: 'var(--color-brand-navy)' }}
                >
                  User Details
                </h3>
                <button
                  onClick={() => {
                    setViewUser(null);
                    setLoadingUserId(null);
                    setActiveTab('info');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                    <p className="text-gray-500">Loading user details...</p>
                  </div>
                </div>
              ) : viewUser ? (
                <>
                  <div className="border-b border-gray-200 px-6">
                    <nav className="flex gap-4 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('info')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'info'
                            ? 'border-brand-blue text-brand-blue'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        style={activeTab === 'info' ? { borderColor: 'var(--color-brand-blue)', color: 'var(--color-brand-blue)' } : {}}
                      >
                        Basic Info
                      </button>
                      <button
                        onClick={() => setActiveTab('enrollments')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'enrollments'
                            ? 'border-brand-blue text-brand-blue'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        style={activeTab === 'enrollments' ? { borderColor: 'var(--color-brand-blue)', color: 'var(--color-brand-blue)' } : {}}
                      >
                        Enrollments ({viewUser.totalEnrollments || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('purchases')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'purchases'
                            ? 'border-brand-blue text-brand-blue'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        style={activeTab === 'purchases' ? { borderColor: 'var(--color-brand-blue)', color: 'var(--color-brand-blue)' } : {}}
                      >
                        Purchases ({viewUser.totalPurchases || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'quizzes'
                            ? 'border-brand-blue text-brand-blue'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        style={activeTab === 'quizzes' ? { borderColor: 'var(--color-brand-blue)', color: 'var(--color-brand-blue)' } : {}}
                      >
                        Quiz Attempts ({viewUser.totalQuizAttempts || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('admissions')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === 'admissions'
                            ? 'border-brand-blue text-brand-blue'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                        style={activeTab === 'admissions' ? { borderColor: 'var(--color-brand-blue)', color: 'var(--color-brand-blue)' } : {}}
                      >
                        Admissions ({viewUser.totalAdmissions || 0})
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {activeTab === 'info' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</label>
                            <p className="mt-1 text-gray-900 font-mono">{viewUser.userId}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                            <p className="mt-1 text-gray-900 font-semibold">{viewUser.fullname}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                            <p className="mt-1 text-gray-900">{viewUser.email}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</label>
                            <p className="mt-1 text-gray-900">{viewUser.contact}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</label>
                            <p className="mt-1 text-gray-900">{viewUser.address}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</label>
                            <p className="mt-1 text-gray-900">{formatDate(viewUser.dob)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Interested In</label>
                            <p className="mt-1 text-gray-900 capitalize">{viewUser.interested}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Latest Qualification</label>
                            <p className="mt-1 text-gray-900 capitalize">{viewUser.latestQualification}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                            <div className="mt-1">
                              {(() => {
                                const roleColor = getRoleBadgeColor(viewUser.role);
                                return (
                                  <span 
                                    className="inline-block px-2.5 py-1 text-xs font-medium rounded-full border"
                                    style={{
                                      backgroundColor: roleColor.bg,
                                      color: roleColor.text,
                                      borderColor: roleColor.border,
                                    }}
                                  >
                                    {viewUser.role}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification Status</label>
                            <div className="mt-1">
                              {viewUser.isVerified ? (
                                <span 
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                                  style={{
                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                    color: 'var(--color-success)',
                                    borderColor: 'rgba(46, 125, 50, 0.2)',
                                  }}
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              ) : (
                                <span 
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                                  style={{
                                    backgroundColor: 'var(--color-gray-100)',
                                    color: 'var(--color-gray-600)',
                                    borderColor: 'var(--color-gray-200)',
                                  }}
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  Unverified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'enrollments' && (
                      <div className="space-y-4">
                        {!viewUser.enrollments || viewUser.enrollments.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No enrollments found</p>
                        ) : (
                          viewUser.enrollments.map((enrollment) => (
                            <div key={enrollment.enrollmentId} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{enrollment.trainingName}</h4>
                                  <p className="text-xs text-gray-500 mt-1">ID: {enrollment.enrollmentId}</p>
                                </div>
                                <span 
                                  className="px-2.5 py-1 text-xs font-medium rounded-full border"
                                  style={{
                                    backgroundColor: enrollment.status === 'ACTIVE' ? 'rgba(46, 125, 50, 0.1)' : 'var(--color-gray-100)',
                                    color: enrollment.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-gray-600)',
                                    borderColor: enrollment.status === 'ACTIVE' ? 'rgba(46, 125, 50, 0.2)' : 'var(--color-gray-200)',
                                  }}
                                >
                                  {enrollment.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500">Enrolled:</span>
                                  <span className="ml-2 text-gray-900">{formatDate(enrollment.enrollmentDate)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Amount:</span>
                                  <span className="ml-2 text-gray-900">NPR {enrollment.paidAmount.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Payment:</span>
                                  <span className="ml-2 text-gray-900">{enrollment.paymentMethod}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Progress:</span>
                                  <span className="ml-2 text-gray-900">{enrollment.progressPercentage}%</span>
                                </div>
                              </div>
                              {enrollment.remarks && (
                                <p className="text-xs text-gray-500 mt-3 italic">{enrollment.remarks}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'purchases' && (
                      <div className="space-y-4">
                        {!viewUser.purchases || viewUser.purchases.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No purchases found</p>
                        ) : (
                          viewUser.purchases.map((purchase) => (
                            <div key={purchase.purchaseId} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {purchase.setName || purchase.trainingName || 'Unknown Item'}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">Transaction: {purchase.transactionId}</p>
                                </div>
                                <span 
                                  className="px-2.5 py-1 text-xs font-medium rounded-full border"
                                  style={{
                                    backgroundColor: purchase.purchaseStatus === 'PAID' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(249, 168, 37, 0.1)',
                                    color: purchase.purchaseStatus === 'PAID' ? 'var(--color-success)' : 'var(--color-warning)',
                                    borderColor: purchase.purchaseStatus === 'PAID' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(249, 168, 37, 0.2)',
                                  }}
                                >
                                  {purchase.purchaseStatus.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500">Amount:</span>
                                  <span className="ml-2 text-gray-900 font-semibold">NPR {purchase.amount.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Date:</span>
                                  <span className="ml-2 text-gray-900">{formatDate(purchase.purchaseDate)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Type:</span>
                                  <span className="ml-2 text-gray-900">{purchase.setId ? 'Question Set' : 'Training'}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'quizzes' && (
                      <div className="space-y-4">
                        {!viewUser.quizAttempts || viewUser.quizAttempts.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No quiz attempts found</p>
                        ) : (
                          viewUser.quizAttempts.map((attempt) => (
                            <div key={attempt.attemptId} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{attempt.setName}</h4>
                                  <p className="text-xs text-gray-500 mt-1">Attempt ID: {attempt.attemptId}</p>
                                </div>
                                <span 
                                  className="px-2.5 py-1 text-xs font-medium rounded-full border"
                                  style={{
                                    backgroundColor: 'rgba(13, 71, 161, 0.1)',
                                    color: 'var(--color-brand-blue)',
                                    borderColor: 'rgba(13, 71, 161, 0.2)',
                                  }}
                                >
                                  {attempt.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500">Score:</span>
                                  <span className="ml-2 text-gray-900 font-semibold">{attempt.score}/{attempt.totalQuestions}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Date:</span>
                                  <span className="ml-2 text-gray-900">{formatDate(attempt.attemptDate)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Time Taken:</span>
                                  <span className="ml-2 text-gray-900">{attempt.timeTaken} min</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'admissions' && (
                      <div className="space-y-4">
                        {!viewUser.admissions || viewUser.admissions.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No admissions found</p>
                        ) : (
                          viewUser.admissions.map((admission) => (
                            <div key={admission.admissionId} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{admission.collegeName}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{admission.courseName}</p>
                                  <p className="text-xs text-gray-500 mt-1">ID: {admission.admissionId}</p>
                                </div>
                                <span 
                                  className="px-2.5 py-1 text-xs font-medium rounded-full border"
                                  style={{
                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                    color: 'var(--color-success)',
                                    borderColor: 'rgba(46, 125, 50, 0.2)',
                                  }}
                                >
                                  {admission.status}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Admission Date:</span>
                                <span className="ml-2 text-gray-900">{formatDate(admission.admissionDate)}</span>
                              </div>
                              {admission.remarks && (
                                <p className="text-xs text-gray-500 mt-3 italic">{admission.remarks}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
