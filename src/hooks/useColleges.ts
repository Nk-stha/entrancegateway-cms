import { useState, useEffect, useCallback } from 'react';
import { collegeService } from '@/services/college.service';
import type { College, CollegeQueryParams } from '@/types/college.types';

interface UseCollegesResult {
  colleges: College[];
  loading: boolean;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  refetch: () => Promise<void>;
}

export function useColleges(params: CollegeQueryParams): UseCollegesResult {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    const result = await collegeService.getColleges(params);

    setColleges(result.colleges);
    setTotalElements(result.totalElements);
    setTotalPages(result.totalPages);
    setCurrentPage(result.currentPage);
    setLoading(false);
  }, [params.page, params.size, params.sortBy, params.sortDir]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  return {
    colleges,
    loading,
    totalElements,
    totalPages,
    currentPage,
    refetch: fetchColleges,
  };
}
