'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { enrollmentService } from '@/services/enrollment.service';
import { toast } from '@/lib/utils/toast';
import type { EnrollmentApiResponse } from '@/types/enrollment.types';

export default function EnrollmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const enrollmentId = parseInt(params.id as string);
  
  const [enrollment, setEnrollment] = useState<EnrollmentApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const loadEnrollment = async () => {
      setLoading(true);
      const data = await enrollmentService.getEnrollmentById(enrollmentId);

      if (!data) {
        setNotFound(true);
        toast.error('Enrollment not found');
        setLoading(false);
        return;
      }

      setEnrollment(data);
      setLoading(false);
    };

    loadEnrollment();
  }, [enrollmentId]);

  const handleApprove = async () => {
    if (!enrollment) return;

    setActionLoading(true);
    try {
      const updatedEnrollment = await enrollmentService.approveEnrollment(enrollmentId);
      if (updatedEnrollment) {
        setEnrollment(updatedEnrollment);
        toast.success('Enrollment approved successfully');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve enrollment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!enrollment || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const updatedEnrollment = await enrollmentService.rejectEnrollment(enrollmentId, rejectionReason);
      if (updatedEnrollment) {
        setEnrollment(updatedEnrollment);
        toast.success('Enrollment rejected');
        setShowRejectModal(false);
        setRejectionReason('');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject enrollment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!enrollment) return;

    setActionLoading(true);
    try {
      await enrollmentService.cancelEnrollment(enrollmentId);
      toast.success('Enrollment cancelled successfully');
      setShowCancelModal(false);
      router.push('/dashboard/enrollments');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel enrollment');
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: {
        bg: 'var(--color-warning)',
        label: 'PENDING',
      },
      PAYMENT_PENDING: {
        bg: 'var(--color-warning)',
        label: 'PAYMENT PENDING',
      },
      PAYMENT_RECEIVED_ADMIN_APPROVAL_PENDING: {
        bg: 'var(--color-brand-gold)',
        label: 'AWAITING APPROVAL',
      },
      ACTIVE: {
        bg: 'var(--color-success)',
        label: 'ACTIVE',
      },
      COMPLETED: {
        bg: 'var(--color-brand-blue)',
        label: 'COMPLETED',
      },
      CANCELLED: {
        bg: 'var(--color-gray-600)',
        label: 'CANCELLED',
      },
      PAYMENT_FAILED: {
        bg: 'var(--color-error)',
        label: 'PAYMENT FAILED',
      },
      EXPIRED: {
        bg: 'var(--color-gray-500)',
        label: 'EXPIRED',
      },
      SUSPENDED: {
        bg: 'var(--color-error)',
        label: 'SUSPENDED',
      },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string): { date: string; time: string } => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch {
      return { date: dateString, time: '' };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
              <p className="text-gray-500">Loading enrollment...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (notFound || !enrollment) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 mb-4">Enrollment not found</p>
              <button
                onClick={() => router.push('/dashboard/enrollments')}
                className="px-4 py-2 font-semibold rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--color-brand-blue)',
                  color: 'white',
                }}
              >
                Back to Enrollments
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const statusConfig = getStatusConfig(enrollment.status);
  const enrollmentDateTime = formatDateTime(enrollment.enrollmentDate);
  const createdDateTime = formatDateTime(enrollment.createdAt);
  const updatedDateTime = formatDateTime(enrollment.updatedAt);

  const mapPaymentMethodDisplay = (method: string): string => {
    const methodMap: Record<string, string> = {
      'ESEWA': 'esewa',
      'KHALTI': 'khalti',
      'BANK_TRANSFER': 'bank transfer',
    };
    return methodMap[method] || method.toLowerCase();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Back Button */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/dashboard/enrollments"
            className="flex items-center font-semibold hover:underline transition-all text-sm md:text-base"
            style={{ color: 'var(--color-brand-navy)' }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Enrollments
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1
              className="text-2xl md:text-3xl font-bold font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Enrollment Details: {enrollment.userName}
            </h1>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white w-fit"
              style={{ backgroundColor: statusConfig.bg }}
            >
              {statusConfig.label}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {(enrollment.status === 'PENDING' || enrollment.status === 'PAYMENT_RECEIVED_ADMIN_APPROVAL_PENDING') && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm text-sm md:text-base text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-success)' }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm text-sm md:text-base text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-error)' }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </>
            )}
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={actionLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors shadow-sm text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Cancel Enrollment
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Paid Amount
            </div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-brand-navy)' }}>
              NPR {enrollment.paidAmount.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Progress
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-brand-navy)' }}>
                {enrollment.progressPercentage}%
              </div>
              <div className="flex-grow bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${enrollment.progressPercentage}%`,
                    backgroundColor: 'var(--color-brand-blue)',
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Enrollment Date
            </div>
            <div className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-brand-navy)' }}>
              {enrollmentDateTime.date}
            </div>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Payment Method
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="text-xl md:text-2xl font-bold uppercase" style={{ color: 'var(--color-brand-navy)' }}>
                {mapPaymentMethodDisplay(enrollment.paymentMethod)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Student & Training Information */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base md:text-lg font-bold" style={{ color: 'var(--color-brand-navy)' }}>
                  Student & Training Information
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-6 md:gap-x-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Training Name
                    </label>
                    <p className="text-gray-900 font-medium">{enrollment.trainingName}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Student Name
                    </label>
                    <p className="text-gray-900 font-medium">{enrollment.userName}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Enrollment ID
                    </label>
                    <p className="text-gray-900 font-mono">{enrollment.enrollmentId}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Status Remarks
                    </label>
                    <p className="font-medium italic" style={{ color: 'var(--color-success)' }}>
                      {enrollment.remarks || 'No remarks'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Verification */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base md:text-lg font-bold" style={{ color: 'var(--color-brand-navy)' }}>
                  Payment Verification
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Payment Reference
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-base md:text-lg" style={{ color: 'var(--color-brand-blue)' }}>
                      {enrollment.paymentReference}
                    </p>
                    <button className="text-gray-400 hover:text-brand-blue transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {enrollment.paymentProofName ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Proof of Payment
                    </label>
                    <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                      <div className="relative w-full" style={{ minHeight: '300px' }}>
                        <Image
                          src={enrollment.paymentProofName}
                          alt="Payment Proof"
                          width={800}
                          height={600}
                          className="w-full h-auto object-contain"
                          style={{ maxHeight: '500px' }}
                          unoptimized
                        />
                      </div>
                      <a
                        href={enrollment.paymentProofName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--color-brand-blue)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Full Size
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Proof of Payment
                    </label>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-400">No payment proof uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base md:text-lg font-bold" style={{ color: 'var(--color-brand-navy)' }}>
                  Audit Trail
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6 md:space-y-8 relative">
                    <div className="flex gap-3 md:gap-4 items-start">
                      <div
                        className="mt-1.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white z-10"
                        style={{ backgroundColor: 'var(--color-brand-blue)' }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Enrollment Created</p>
                        <p className="text-xs text-gray-500">
                          {createdDateTime.date} • {createdDateTime.time}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 italic">Initial enrollment record created</p>
                      </div>
                    </div>
                    <div className="flex gap-3 md:gap-4 items-start">
                      <div
                        className="mt-1.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white z-10"
                        style={{ backgroundColor: 'var(--color-success)' }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Last Updated</p>
                        <p className="text-xs text-gray-500">
                          {updatedDateTime.date} • {updatedDateTime.time}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 italic">Most recent update to enrollment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-error)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-brand-navy)' }}>
                    Reject Enrollment
                  </h3>
                  <p className="text-sm text-gray-500">
                    {enrollment?.userName}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this enrollment. This will be visible to the student.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Invalid payment proof - image not clear"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                  rows={4}
                  disabled={actionLoading}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-error)' }}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Enrollment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-warning)' }}>
                  <svg className="w-6 h-6" style={{ color: 'var(--color-brand-navy)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-brand-navy)' }}>
                    Cancel Enrollment
                  </h3>
                  <p className="text-sm text-gray-500">
                    {enrollment?.userName}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this enrollment? This action cannot be undone and the student will be notified.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Enrollment
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-error)' }}
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Enrollment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
