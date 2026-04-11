import { useState, useEffect, useCallback, useRef } from 'react';
import { quizTemplateService } from '@/services/quizTemplate.service';
import type {
  QuizTemplateMutationResponse,
  PaginatedQueryParams,
} from '@/types/quiz.types';

export function useQuizTemplates(initialParams: PaginatedQueryParams = {}) {
  const [templates, setTemplates] = useState<QuizTemplateMutationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLast, setIsLast] = useState(false);

  const paramsRef = useRef(initialParams);

  const fetchTemplates = useCallback(async (params: PaginatedQueryParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await quizTemplateService.getQuizTemplates({
        ...paramsRef.current,
        ...params,
      });

      if (result.success && result.data) {
        setTemplates(result.data.content);
        setTotalElements(result.data.totalElements);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.pageNumber);
        setPageSize(result.data.pageSize);
        setIsLast(result.data.last);
      } else {
        setError(result.error || 'Unable to load quiz templates.');
        setTemplates([]);
      }
    } catch {
      setError('Unable to load quiz templates. Please try again later.');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchTemplates(paramsRef.current);
  }, [fetchTemplates]);

  useEffect(() => {
    paramsRef.current = initialParams;
    fetchTemplates();
  }, [fetchTemplates, initialParams.page, initialParams.size, initialParams.sortBy, initialParams.sortDir]);

  return {
    templates,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isLast,
    refetch,
  };
}
