'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormModal } from '@/components/ui/FormModal';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { auditService } from '@/services/audit.service';
import { toast } from '@/lib/utils/toast';
import type { AuditLog, AuditActionType } from '@/types/audit.types';

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { logs, loading, totalElements, totalPages, currentPage } = useAuditLogs({
    page,
    size: pageSize,
    sortBy: 'timestamp',
    sortDir: 'desc',
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleViewDetails = async (logId: number) => {
    setLoadingDetail(true);
    setShowDetailModal(true);

    const result = await auditService.getAuditLogById(logId);

    if (result.success && result.log) {
      setSelectedLog(result.log);
    } else {
      toast.error(result.error || 'Failed to load audit log details');
      setShowDetailModal(false);
    }

    setLoadingDetail(false);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  const handleExport = async () => {
    setExporting(true);
    const result = await auditService.exportAuditLogs({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (result.success) {
      toast.success('Audit logs exported successfully');
    } else {
      toast.error(result.error || 'Failed to export audit logs');
    }
    setExporting(false);
  };

  const getActionBadgeColor = (action: AuditActionType) => {
    const colors = {
      LOGIN_SUCCESS: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      LOGIN_FAILURE: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      LOGIN_FAILED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      TOKEN_REFRESH: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
      CREATE: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      UPDATE: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      DELETE: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      VIEW: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
      EXPORT: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    };
    return colors[action] || colors.VIEW;
  };

  const getStatusBadgeColor = (status: number) => {
    if (status >= 200 && status < 300) {
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    }
    if (status >= 400 && status < 500) {
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
    }
    if (status >= 500) {
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    }
    return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading && logs.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading audit logs..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider font-medium">
              <span style={{ color: 'var(--color-brand-blue)' }}>System Administration</span>
              <span className="text-gray-400">/</span>
              <span style={{ color: 'var(--color-brand-blue)' }}>Audit Logs</span>
            </div>
            <h1
              className="text-2xl md:text-3xl font-bold font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Security & System Audit Logs
            </h1>
          </div>

          <div className="bg-white p-4 border border-gray-200 rounded-t-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                placeholder="Select start date and time"
              />

              <Input
                label="End Date & Time"
                type="datetime-local"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                placeholder="Select end date and time"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleExport}
                disabled={exporting || logs.length === 0}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-brand-blue)',
                  color: 'white',
                }}
              >
                {exporting ? 'Exporting...' : 'Export to CSV'}
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <EmptyState type="empty" message="No audit logs found" />
          ) : (
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-b-lg">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">
                        ID
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Admin Email
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Entity
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => {
                      const isExpanded = expandedRow === log.id;
                      const actionColors = getActionBadgeColor(log.action);
                      const statusColors = getStatusBadgeColor(log.responseStatus);
                      const hasError = log.responseStatus >= 400;

                      return (
                        <React.Fragment key={log.id}>
                          <tr
                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                              isExpanded ? 'bg-gray-50' : ''
                            } ${hasError ? 'border-l-4 border-l-red-500' : ''}`}
                            onClick={() => toggleRow(log.id)}
                          >
                            <td className="px-6 py-4 text-sm font-mono text-gray-500">{log.id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {log.adminEmail}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${actionColors.bg} ${actionColors.text} ${actionColors.border}`}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{log.entityType}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                              >
                                {log.responseStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-500">
                              {log.ipAddress}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {formatTimestamp(log.timestamp)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                                style={{ color: isExpanded ? 'var(--color-brand-navy)' : undefined }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-gray-50">
                              <td className="px-6 pb-6 pt-0" colSpan={8}>
                                <div className="bg-white border border-gray-200 rounded-lg p-5 grid grid-cols-2 gap-6 shadow-inner mt-4">
                                  <div className="space-y-4">
                                    {log.description && (
                                      <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                          Description
                                        </h4>
                                        <p
                                          className={`text-sm font-medium p-2 rounded border ${
                                            hasError
                                              ? 'bg-red-50 border-red-100 text-red-700'
                                              : 'bg-gray-50 border-gray-200 text-gray-700'
                                          }`}
                                        >
                                          {log.description}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        User Agent
                                      </h4>
                                      <p className="text-sm text-gray-600 break-all">
                                        {log.userAgent}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        Admin Role
                                      </h4>
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                        {log.adminRole}
                                      </span>
                                    </div>
                                    <div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewDetails(log.id);
                                        }}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                                        style={{
                                          backgroundColor: 'var(--color-brand-blue)',
                                          color: 'white',
                                        }}
                                      >
                                        View Full Details
                                      </button>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        Request URI
                                      </h4>
                                      <p className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded break-all">
                                        {log.requestUri}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        Request Method
                                      </h4>
                                      <span className="px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded">
                                        {log.requestMethod}
                                      </span>
                                    </div>
                                    {log.entityId && (
                                      <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                          Entity ID
                                        </h4>
                                        <p className="text-sm font-mono text-gray-600">
                                          {log.entityId}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="block md:hidden divide-y divide-gray-200">
                {logs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  const actionColors = getActionBadgeColor(log.action);
                  const statusColors = getStatusBadgeColor(log.responseStatus);
                  const hasError = log.responseStatus >= 400;

                  return (
                    <div
                      key={log.id}
                      className={`p-4 space-y-3 ${hasError ? 'border-l-4 border-l-red-500' : ''}`}
                    >
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => toggleRow(log.id)}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{log.adminEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {log.id}</p>
                        </div>
                        <svg
                          className={`w-5 h-5 transition-transform flex-shrink-0 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          style={{ color: isExpanded ? 'var(--color-brand-navy)' : undefined }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${actionColors.bg} ${actionColors.text} ${actionColors.border}`}
                        >
                          {log.action}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {log.entityType}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                        >
                          {log.responseStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500">IP Address</p>
                          <p className="font-mono text-gray-900">{log.ipAddress}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Timestamp</p>
                          <p className="text-gray-900">{formatTimestamp(log.timestamp)}</p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 mt-3">
                          {log.description && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Description
                              </p>
                              <p
                                className={`text-xs p-2 rounded border ${
                                  hasError
                                    ? 'bg-red-50 border-red-100 text-red-700'
                                    : 'bg-white border-gray-200 text-gray-700'
                                }`}
                              >
                                {log.description}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              Admin Role
                            </p>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                              {log.adminRole}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              Request URI
                            </p>
                            <p className="text-xs font-mono text-gray-600 bg-white p-2 rounded border border-gray-200 break-all">
                              {log.requestUri}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              Request Method
                            </p>
                            <span className="px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded">
                              {log.requestMethod}
                            </span>
                          </div>
                          {log.entityId && (
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Entity ID
                              </p>
                              <p className="text-xs font-mono text-gray-600">{log.entityId}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200">
                  {loading ? (
                    <div className="flex items-center justify-center w-full py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-900">{logs.length}</span> of{' '}
                        <span className="font-medium text-gray-900">{totalElements}</span> entries
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                        onPageChange={setPage}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <FormModal
          isOpen={showDetailModal}
          title="Audit Log Details"
          onClose={handleCloseDetailModal}
          size="lg"
        >
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading details...</p>
              </div>
            </div>
          ) : selectedLog ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Audit Log ID
                  </h3>
                  <p className="text-sm font-mono text-gray-900">{selectedLog.id}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Timestamp
                  </h3>
                  <p className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Admin Email
                  </h3>
                  <p className="text-sm font-medium text-gray-900">{selectedLog.adminEmail}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Admin Name
                  </h3>
                  <p className="text-sm text-gray-900">{selectedLog.adminName}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Admin Role
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                    {selectedLog.adminRole}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Action
                  </h3>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                      getActionBadgeColor(selectedLog.action).bg
                    } ${getActionBadgeColor(selectedLog.action).text} ${
                      getActionBadgeColor(selectedLog.action).border
                    }`}
                  >
                    {selectedLog.action}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Entity Type
                  </h3>
                  <p className="text-sm text-gray-900">{selectedLog.entityType}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Entity ID
                  </h3>
                  <p className="text-sm font-mono text-gray-900">
                    {selectedLog.entityId || 'N/A'}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Response Status
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded border ${
                      getStatusBadgeColor(selectedLog.responseStatus).bg
                    } ${getStatusBadgeColor(selectedLog.responseStatus).text} ${
                      getStatusBadgeColor(selectedLog.responseStatus).border
                    }`}
                  >
                    {selectedLog.responseStatus}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    IP Address
                  </h3>
                  <p className="text-sm font-mono text-gray-900">{selectedLog.ipAddress}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Description
                </h3>
                <p
                  className={`text-sm p-3 rounded border ${
                    selectedLog.responseStatus >= 400
                      ? 'bg-red-50 border-red-100 text-red-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  {selectedLog.description || 'No description available'}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Request URI
                </h3>
                <p className="text-sm font-mono text-gray-600 bg-gray-50 p-3 rounded border border-gray-200 break-all">
                  {selectedLog.requestUri}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Request Method
                </h3>
                <span className="px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded">
                  {selectedLog.requestMethod}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  User Agent
                </h3>
                <p className="text-sm text-gray-600 break-all bg-gray-50 p-3 rounded border border-gray-200">
                  {selectedLog.userAgent}
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-brand-blue)',
                    color: 'white',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No audit log data available</p>
            </div>
          )}
        </FormModal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
