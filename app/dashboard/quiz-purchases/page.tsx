'use client';

import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useQuizPurchases } from '@/hooks/useQuizPurchases';
import { purchaseService } from '@/services/purchase.service';
import { toast } from '@/lib/utils/toast';
import { useState, useEffect } from 'react';
import type { PurchaseStatus, QuizPurchase } from '@/types/purchase.types';

export default function QuizPurchasesPage() {
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | ''>('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<QuizPurchase | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  const { purchases, loading, error, pagination, goToPage, updateFilters, refetch } = useQuizPurchases({
    page: 0,
    size: 10,
    sortBy: 'purchaseDate',
    sortDir: 'desc',
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFilterChange = () => {
    const userId = userIdFilter.trim();
    
    if (userId && isNaN(parseInt(userId))) {
      toast.error('User ID must be a valid number');
      return;
    }

    updateFilters({
      status: statusFilter || undefined,
      userId: userId ? parseInt(userId) : undefined,
    });
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setUserIdFilter('');
    updateFilters({
      status: undefined,
      userId: undefined,
    });
  };

  const handleRowClick = (purchase: QuizPurchase) => {
    setSelectedPurchase(purchase);
  };

  const handleCloseSidebar = () => {
    setSelectedPurchase(null);
  };

  const handleApprovePurchase = async () => {
    if (!selectedPurchase) return;

    setActionLoading(true);
    try {
      const result = await purchaseService.approvePurchase(selectedPurchase.purchaseId);
      
      if (result.success) {
        toast.success('Purchase approved successfully');
        setSelectedPurchase(null);
        refetch();
      } else {
        toast.error(result.error || 'Failed to approve purchase');
      }
    } catch (error) {
      console.error('Error approving purchase:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPurchase = async () => {
    if (!selectedPurchase) return;

    setActionLoading(true);
    try {
      const result = await purchaseService.rejectPurchase(selectedPurchase.purchaseId);
      
      if (result.success) {
        toast.success('Purchase rejected successfully');
        setSelectedPurchase(null);
        refetch();
      } else {
        toast.error(result.error || 'Failed to reject purchase');
      }
    } catch (error) {
      console.error('Error rejecting purchase:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeColor = (status: PurchaseStatus) => {
    const colors = {
      PAID: { bg: 'rgba(46, 125, 50, 0.1)', text: 'var(--color-success)', border: 'rgba(46, 125, 50, 0.2)' },
      PAYMENT_VERIFIED: { bg: 'rgba(46, 125, 50, 0.1)', text: 'var(--color-success)', border: 'rgba(46, 125, 50, 0.2)' },
      PAYMENT_RECEIVED_ADMIN_APPROVAL_PENDING: { bg: 'rgba(249, 168, 37, 0.1)', text: 'var(--color-warning)', border: 'rgba(249, 168, 37, 0.2)' },
      PENDING: { bg: 'rgba(249, 168, 37, 0.1)', text: 'var(--color-warning)', border: 'rgba(249, 168, 37, 0.2)' },
      UNPAID: { bg: 'var(--color-gray-100)', text: 'var(--color-gray-600)', border: 'var(--color-gray-200)' },
      FAILED: { bg: 'rgba(211, 47, 47, 0.1)', text: 'var(--color-error)', border: 'rgba(211, 47, 47, 0.2)' },
      ABORTED: { bg: 'rgba(211, 47, 47, 0.1)', text: 'var(--color-error)', border: 'rgba(211, 47, 47, 0.2)' },
      CANCELLED_BY_ADMIN: { bg: 'rgba(211, 47, 47, 0.1)', text: 'var(--color-error)', border: 'rgba(211, 47, 47, 0.2)' },
    };
    return colors[status] || colors.UNPAID;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
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
              Quiz Purchases
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Manage and monitor all quiz set purchases.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                type="text"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                placeholder="Filter by user ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PurchaseStatus | '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
              >
                <option value="">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PENDING">Pending</option>
                <option value="PAYMENT_RECEIVED_ADMIN_APPROVAL_PENDING">Awaiting Approval</option>
                <option value="PAYMENT_VERIFIED">Payment Verified</option>
                <option value="ABORTED">Aborted</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED_BY_ADMIN">Cancelled by Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1 flex items-end gap-2">
              <button
                onClick={handleFilterChange}
                disabled={loading}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                style={{ backgroundColor: 'var(--color-brand-blue)' }}
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                <p className="text-gray-500">Loading purchases...</p>
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
          ) : purchases.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500">No purchases found</p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Purchase ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Quiz Set</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Payment Proof</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-sm">
                    {purchases.map((purchase, index) => {
                      const statusColor = getStatusBadgeColor(purchase.purchaseStatus);
                      return (
                        <tr 
                          key={purchase.purchaseId}
                          onClick={() => handleRowClick(purchase)}
                          className={`transition-colors cursor-pointer hover:bg-gray-50/80 ${index % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                        >
                          <td className="px-6 py-4 font-mono text-gray-500">{purchase.purchaseId || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold" style={{ color: 'var(--color-brand-navy)' }}>
                                {purchase.userName || 'Unknown User'}
                              </div>
                              <div className="text-xs text-gray-500">ID: {purchase.userId || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{purchase.setName || 'N/A'}</div>
                            {purchase.setId && <div className="text-xs text-gray-500">Set ID: {purchase.setId}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">
                              NPR {(purchase.amount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(purchase.purchaseDate)}</td>
                          <td className="px-6 py-4">
                            <span 
                              className="px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap inline-block"
                              style={{
                                backgroundColor: statusColor.bg,
                                color: statusColor.text,
                                borderColor: statusColor.border,
                              }}
                            >
                              {purchase.purchaseStatus ? purchase.purchaseStatus.replace(/_/g, ' ') : 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {purchase.paymentProof ? (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-brand-blue transition-colors group">
                                <img
                                  src={purchase.paymentProof}
                                  alt="Payment Proof"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No proof</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y divide-gray-200">
                {purchases.map((purchase) => {
                  const statusColor = getStatusBadgeColor(purchase.purchaseStatus);
                  return (
                    <div 
                      key={purchase.purchaseId} 
                      onClick={() => handleRowClick(purchase)}
                      className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-1 truncate" style={{ color: 'var(--color-brand-navy)' }}>
                            {purchase.userName || 'Unknown User'}
                          </h3>
                          <p className="text-xs text-gray-400">User ID: {purchase.userId || 'N/A'}</p>
                        </div>
                        <span 
                          className="px-2.5 py-1 text-xs font-medium rounded-full border flex-shrink-0 max-w-[140px] text-center"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            borderColor: statusColor.border,
                          }}
                        >
                          {purchase.purchaseStatus ? purchase.purchaseStatus.replace(/_/g, ' ') : 'UNKNOWN'}
                        </span>
                      </div>

                      {purchase.paymentProof && (
                        <div className="mb-3">
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={purchase.paymentProof}
                              alt="Payment Proof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                              Payment Proof
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 mb-3">
                        <div className="flex items-start justify-between text-sm gap-2">
                          <span className="text-gray-500 flex-shrink-0">Quiz Set:</span>
                          <span className="font-medium text-gray-900 text-right break-words">{purchase.setName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-semibold text-gray-900">NPR {(purchase.amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Date:</span>
                          <span className="text-gray-900">{formatDate(purchase.purchaseDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Purchase ID:</span>
                          <span className="font-mono text-gray-600">{purchase.purchaseId || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 break-all">
                          Transaction: <span className="font-mono">{purchase.transactionId || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {!error && purchases.length > 0 && (
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
                  Showing <span className="font-bold" style={{ color: 'var(--color-brand-navy)' }}>
                    {Math.min(pagination.pageSize, purchases.length)}
                  </span> of{' '}
                  <span className="font-bold" style={{ color: 'var(--color-brand-navy)' }}>{pagination.totalElements}</span> purchases
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

        {selectedPurchase && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
              onClick={handleCloseSidebar}
            ></div>
            
            <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h3 
                  className="text-xl font-bold"
                  style={{ color: 'var(--color-brand-navy)' }}
                >
                  Purchase Details
                </h3>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchase ID</label>
                    <p className="mt-1 text-gray-900 font-mono">{selectedPurchase.purchaseId || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-1">
                      {(() => {
                        const statusColor = getStatusBadgeColor(selectedPurchase.purchaseStatus);
                        return (
                          <span 
                            className="inline-block px-2.5 py-1 text-xs font-medium rounded-full border"
                            style={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              borderColor: statusColor.border,
                            }}
                          >
                            {selectedPurchase.purchaseStatus ? selectedPurchase.purchaseStatus.replace(/_/g, ' ') : 'UNKNOWN'}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User Name</label>
                    <p className="mt-1 text-gray-900 font-semibold">{selectedPurchase.userName || 'Unknown User'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</label>
                    <p className="mt-1 text-gray-900">{selectedPurchase.userId || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz Set Name</label>
                    <p className="mt-1 text-gray-900">{selectedPurchase.setName || 'N/A'}</p>
                  </div>

                  {selectedPurchase.setId && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quiz Set ID</label>
                      <p className="mt-1 text-gray-900">{selectedPurchase.setId}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</label>
                    <p className="mt-1 text-gray-900 font-bold text-lg">NPR {(selectedPurchase.amount || 0).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchase Date</label>
                    <p className="mt-1 text-gray-900">{formatDate(selectedPurchase.purchaseDate)}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</label>
                    <p className="mt-1 text-gray-900 font-mono text-sm break-all">{selectedPurchase.transactionId || 'N/A'}</p>
                  </div>

                  {selectedPurchase.paymentMethod && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</label>
                      <p className="mt-1 text-gray-900">{selectedPurchase.paymentMethod.replace(/_/g, ' ')}</p>
                    </div>
                  )}

                  {selectedPurchase.paymentProof && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Proof</label>
                      <div className="mt-2">
                        <div 
                          onClick={() => setImageModalOpen(true)}
                          className="relative cursor-pointer group rounded-lg overflow-hidden border border-gray-200 hover:border-brand-blue transition-colors"
                        >
                          <img
                            src={selectedPurchase.paymentProof}
                            alt="Payment Proof"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                            <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">Click to view full size</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedPurchase.purchaseStatus === 'PAYMENT_RECEIVED_ADMIN_APPROVAL_PENDING' && (
                  <div className="pt-6 border-t border-gray-200 space-y-3">
                    <button
                      onClick={handleApprovePurchase}
                      disabled={actionLoading}
                      className="w-full px-4 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--color-success)' }}
                    >
                      {actionLoading ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Approve Purchase</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleRejectPurchase}
                      disabled={actionLoading}
                      className="w-full px-4 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--color-error)' }}
                    >
                      {actionLoading ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Reject Purchase</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {selectedPurchase.purchaseStatus !== 'PAYMENT_RECEIVED_ADMIN_APPROVAL_PENDING' && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">
                        {selectedPurchase.purchaseStatus === 'PAID' || selectedPurchase.purchaseStatus === 'PAYMENT_VERIFIED' 
                          ? 'This purchase has already been approved'
                          : selectedPurchase.purchaseStatus === 'CANCELLED_BY_ADMIN'
                          ? 'This purchase has been rejected'
                          : 'No actions available for this purchase status'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {imageModalOpen && selectedPurchase?.paymentProof && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setImageModalOpen(false)}
          >
            <div className="relative max-w-5xl max-h-[90vh] w-full">
              <button
                onClick={() => setImageModalOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedPurchase.paymentProof}
                alt="Payment Proof Full Size"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
                Click outside to close
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
