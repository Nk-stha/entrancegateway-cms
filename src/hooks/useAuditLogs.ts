import { useState, useEffect, useCallback } from 'react';
import { auditService } from '@/services/audit.service';
import type { AuditLog, AuditLogQueryParams } from '@/types/audit.types';

interface UseAuditLogsResult {
  logs: AuditLog[];
  loading: boolean;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  refetch: () => Promise<void>;
}

export function useAuditLogs(params: AuditLogQueryParams): UseAuditLogsResult {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const result = await auditService.getAuditLogs(params);
    
    setLogs(result.logs);
    setTotalElements(result.totalElements);
    setTotalPages(result.totalPages);
    setCurrentPage(result.currentPage);
    setLoading(false);
  }, [
    params.page,
    params.size,
    params.sortBy,
    params.sortDir,
    params.search,
    params.action,
    params.entity,
    params.startDate,
    params.endDate,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    totalElements,
    totalPages,
    currentPage,
    refetch: fetchLogs,
  };
}
