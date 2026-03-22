import { useState, useEffect, useRef } from 'react';
import { syllabusService } from '@/services/syllabus.service';
import type { Syllabus, SyllabusFilters } from '@/types/syllabus.types';
import { toast } from '@/lib/utils/toast';

export function useSyllabus() {
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [filters, setFilters] = useState<SyllabusFilters>({
    affiliation: '',
    courseName: '',
    semester: '',
  });
  const [sortBy, setSortBy] = useState('syllabusTitle');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const requestIdRef = useRef(0);

  const fetchSyllabus = async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

    const params: any = {
      page: currentPage,
      size: pageSize,
      sortBy,
      sortDir,
    };

    if (filters.affiliation) {
      params.affiliation = filters.affiliation;
    }
    if (filters.courseName) {
      params.courseName = filters.courseName;
    }
    if (filters.semester) {
      params.semester = parseInt(filters.semester, 10);
    }

    const result = await syllabusService.getSyllabusList(params);

    if (currentRequestId !== requestIdRef.current) {
      return;
    }

    if (result.error) {
      toast.error(result.error);
    }

    setSyllabusList(result.syllabusList.content);
    setTotalPages(result.syllabusList.totalPages);
    setTotalElements(result.syllabusList.totalElements);
    setIsLast(result.syllabusList.last);
    setLoading(false);
  };

  useEffect(() => {
    fetchSyllabus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortDir]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: keyof SyllabusFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchSyllabus();
  };

  const handleClearFilters = () => {
    setFilters({
      affiliation: '',
      courseName: '',
      semester: '',
    });
    setCurrentPage(0);
    setTimeout(() => {
      fetchSyllabus();
    }, 0);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const handleDownload = async (syllabusId: number, fileName: string) => {
    const result = await syllabusService.downloadSyllabus(syllabusId, fileName);
    
    if (result.success) {
      toast.success('Syllabus downloaded successfully');
    } else {
      toast.error(result.error || 'Failed to download syllabus');
    }
  };

  const handleDelete = async (syllabusId: number) => {
    const result = await syllabusService.deleteSyllabus(syllabusId);
    
    if (result.success) {
      toast.success('Syllabus deleted successfully');
      fetchSyllabus();
    } else {
      toast.error(result.error || 'Failed to delete syllabus');
    }
  };

  return {
    syllabusList,
    loading,
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
    handleDownload,
    handleDelete,
    refetch: fetchSyllabus,
  };
}
