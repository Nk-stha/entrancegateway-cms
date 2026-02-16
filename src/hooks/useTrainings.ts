import { useState, useEffect, useCallback, useRef } from 'react';
import { trainingService } from '@/services/training.service';
import type { Training, TrainingQueryParams } from '@/types/training.types';

export function useTrainings(initialParams: TrainingQueryParams = {}) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    isLast: false,
  });

  // Use ref to store params to avoid dependency issues
  const paramsRef = useRef(initialParams);

  const fetchTrainings = useCallback(async (params: TrainingQueryParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await trainingService.getTrainings({
        ...paramsRef.current,
        ...params,
      });

      setTrainings(result.trainings);
      setPagination({
        totalElements: result.totalElements,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        isLast: result.isLast,
      });
    } catch (err) {
      // Error is already handled in service, but we set a user-friendly message
      setError('Unable to load trainings. Please try again later.');
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchTrainings(paramsRef.current);
  }, [fetchTrainings]);

  const goToPage = useCallback((page: number) => {
    fetchTrainings({ ...paramsRef.current, page });
  }, [fetchTrainings]);

  const changePageSize = useCallback((size: number) => {
    fetchTrainings({ ...paramsRef.current, size, page: 0 });
  }, [fetchTrainings]);

  const changeSorting = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    fetchTrainings({ ...paramsRef.current, sortBy, sortDir, page: 0 });
  }, [fetchTrainings]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  return {
    trainings,
    loading,
    error,
    pagination,
    refetch,
    goToPage,
    changePageSize,
    changeSorting,
  };
}
