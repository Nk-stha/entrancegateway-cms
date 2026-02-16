import { useState, useEffect, useCallback, useRef } from 'react';
import { enrollmentService } from '@/services/enrollment.service';
import type { Enrollment, EnrollmentQueryParams } from '@/types/enrollment.types';

export function useEnrollments(initialParams: EnrollmentQueryParams = {}) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    isLast: false,
  });

  const paramsRef = useRef(initialParams);

  const fetchEnrollments = useCallback(async (params: EnrollmentQueryParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await enrollmentService.getEnrollments({
        ...paramsRef.current,
        ...params,
      });

      setEnrollments(result.enrollments);
      setPagination({
        totalElements: result.totalElements,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        isLast: result.isLast,
      });
    } catch (err) {
      setError('Unable to load enrollments. Please try again later.');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchEnrollments(paramsRef.current);
  }, [fetchEnrollments]);

  const goToPage = useCallback((page: number) => {
    fetchEnrollments({ ...paramsRef.current, page });
  }, [fetchEnrollments]);

  const changePageSize = useCallback((size: number) => {
    fetchEnrollments({ ...paramsRef.current, size, page: 0 });
  }, [fetchEnrollments]);

  const changeSorting = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    fetchEnrollments({ ...paramsRef.current, sortBy, sortDir, page: 0 });
  }, [fetchEnrollments]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    loading,
    error,
    pagination,
    refetch,
    goToPage,
    changePageSize,
    changeSorting,
  };
}
