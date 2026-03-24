import { useState, useEffect, useRef } from 'react';
import { oldQuestionService } from '@/services/oldQuestion.service';
import type { OldQuestion, OldQuestionFilters } from '@/types/oldQuestion.types';
import { toast } from '@/lib/utils/toast';

export function useOldQuestions() {
  const [oldQuestionsList, setOldQuestionsList] = useState<OldQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [filters, setFilters] = useState<OldQuestionFilters>({
    affiliation: '',
    courseName: '',
    year: '',
  });
  const [sortBy, setSortBy] = useState('year');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const requestIdRef = useRef(0);

  const fetchOldQuestions = async (page: number, sort: string, direction: 'asc' | 'desc', currentFilters: OldQuestionFilters) => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const params: any = {
        page,
        size: pageSize,
        sortBy: sort,
        sortDir: direction,
      };

      if (currentFilters.affiliation) {
        params.affiliation = currentFilters.affiliation;
      }
      if (currentFilters.courseName) {
        params.courseName = currentFilters.courseName;
      }
      if (currentFilters.year) {
        const yearNum = parseInt(currentFilters.year, 10);
        if (isFinite(yearNum)) {
          params.year = yearNum;
        }
      }

      const result = await oldQuestionService.getOldQuestionsList(params);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (result.error) {
        toast.error(result.error);
        setOldQuestionsList([]);
        setTotalPages(0);
        setTotalElements(0);
        setIsLast(true);
        setLoading(false);
        return;
      }

      setOldQuestionsList(result.oldQuestionsList.content);
      setTotalPages(result.oldQuestionsList.totalPages);
      setTotalElements(result.oldQuestionsList.totalElements);
      setIsLast(result.oldQuestionsList.last);
      setLoading(false);
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      console.error('Unexpected error fetching old questions:', error);
      toast.error('An unexpected error occurred');
      setOldQuestionsList([]);
      setTotalPages(0);
      setTotalElements(0);
      setIsLast(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOldQuestions(currentPage, sortBy, sortDir, filters);
  }, [currentPage, sortBy, sortDir]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: keyof OldQuestionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchOldQuestions(0, sortBy, sortDir, filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: OldQuestionFilters = {
      affiliation: '',
      courseName: '',
      year: '',
    };
    setFilters(clearedFilters);
    setCurrentPage(0);
    fetchOldQuestions(0, sortBy, sortDir, clearedFilters);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const handleDelete = async (oldQuestionId: number): Promise<boolean> => {
    setDeletingId(oldQuestionId);
    try {
      const result = await oldQuestionService.deleteOldQuestion(oldQuestionId);
      
      if (result.success) {
        toast.success('Old question deleted successfully');
        await fetchOldQuestions(currentPage, sortBy, sortDir, filters);
        return true;
      } else {
        toast.error(result.error || 'Failed to delete old question');
        return false;
      }
    } catch (error) {
      console.error('Unexpected error deleting old question:', error);
      toast.error('An unexpected error occurred while deleting');
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  return {
    oldQuestionsList,
    loading,
    deletingId,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    isLast,
    filters,
    sortBy,
    sortDir,
    handlePageChange,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
    handleSort,
    handleDelete,
    refetch: () => fetchOldQuestions(currentPage, sortBy, sortDir, filters),
  };
}
