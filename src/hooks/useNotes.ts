import { useState, useEffect, useRef } from 'react';
import { noteService } from '@/services/note.service';
import type { Note, NoteFilters } from '@/types/note.types';
import { toast } from '@/lib/utils/toast';

export function useNotes() {
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [filters, setFilters] = useState<NoteFilters>({
    affiliation: '',
    courseName: '',
    semester: '',
  });
  const [sortBy, setSortBy] = useState('noteName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const requestIdRef = useRef(0);

  const fetchNotes = async (page: number, sort: string, direction: 'asc' | 'desc', currentFilters: NoteFilters) => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

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
    if (currentFilters.semester) {
      params.semester = parseInt(currentFilters.semester, 10);
    }

    const result = await noteService.getNotesList(params);

    if (currentRequestId !== requestIdRef.current) {
      return;
    }

    if (result.error) {
      toast.error(result.error);
      setNotesList([]);
      setTotalPages(0);
      setTotalElements(0);
      setIsLast(true);
      setLoading(false);
      return;
    }

    setNotesList(result.notesList.content);
    setTotalPages(result.notesList.totalPages);
    setTotalElements(result.notesList.totalElements);
    setIsLast(result.notesList.last);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes(currentPage, sortBy, sortDir, filters);
  }, [currentPage, sortBy, sortDir]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: keyof NoteFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchNotes(0, sortBy, sortDir, filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: NoteFilters = {
      affiliation: '',
      courseName: '',
      semester: '',
    };
    setFilters(clearedFilters);
    setCurrentPage(0);
    fetchNotes(0, sortBy, sortDir, clearedFilters);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const handleDownload = async (noteId: number, fileName: string) => {
    const result = await noteService.downloadNote(noteId, fileName);
    
    if (result.success) {
      toast.success('Note downloaded successfully');
    } else {
      toast.error(result.error || 'Failed to download note');
    }
  };

  const handleDelete = async (noteId: number): Promise<boolean> => {
    const result = await noteService.deleteNote(noteId);
    
    if (result.success) {
      toast.success('Note deleted successfully');
      fetchNotes(currentPage, sortBy, sortDir, filters);
      return true;
    } else {
      toast.error(result.error || 'Failed to delete note');
      return false;
    }
  };

  return {
    notesList,
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
    refetch: () => fetchNotes(currentPage, sortBy, sortDir, filters),
  };
}
