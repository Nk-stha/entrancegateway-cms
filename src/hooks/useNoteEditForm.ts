import { useState, useEffect } from 'react';
import { noteService } from '@/services/note.service';
import { syllabusService } from '@/services/syllabus.service';
import type { NoteFormData, UpdateNoteRequest } from '@/types/note.types';
import type { Syllabus } from '@/types/syllabus.types';
import { toast } from '@/lib/utils/toast';

const initialFormData: NoteFormData = {
  noteName: '',
  noteDescription: '',
  syllabusId: '',
  file: null,
};

export function useNoteEditForm(noteId: number) {
  const [formData, setFormData] = useState<NoteFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(true);

  useEffect(() => {
    if (noteId <= 0) {
      setLoadingData(false);
      setLoadingSyllabus(false);
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      setLoadingSyllabus(true);

      try {
        const [noteResult, syllabusResult] = await Promise.all([
          noteService.getNoteById(noteId),
          syllabusService.getSyllabusList({ page: 0, size: 1000 }),
        ]);

        if (noteResult.error) {
          toast.error(noteResult.error);
          return;
        }

        if (syllabusResult.error) {
          toast.error(syllabusResult.error);
        } else {
          setSyllabusList(syllabusResult.syllabusList.content);
        }

        if (noteResult.note) {
          const note = noteResult.note;
          setFormData({
            noteName: '',
            noteDescription: note.noteDescription,
            syllabusId: note.syllabusId.toString(),
            file: null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch note data:', error);
        toast.error('Failed to load note data');
      } finally {
        setLoadingData(false);
        setLoadingSyllabus(false);
      }
    };

    fetchData();
  }, [noteId]);

  const handleInputChange = (field: keyof NoteFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.noteDescription.trim()) {
      newErrors.noteDescription = 'Note description is required';
    }

    const syllabusId = parseInt(formData.syllabusId, 10);
    if (!formData.syllabusId || !isFinite(syllabusId) || syllabusId <= 0) {
      newErrors.syllabusId = 'Syllabus is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return false;
    }

    setLoading(true);

    try {
      const requestData: UpdateNoteRequest = {
        noteDescription: formData.noteDescription.trim(),
        syllabusId: parseInt(formData.syllabusId, 10),
      };

      const result = await noteService.updateNote(noteId, requestData);

      if (result.success) {
        toast.success('Note updated successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to update note');
        return false;
      }
    } catch (error) {
      console.error('Unexpected error during note update:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFileOnlyUpdate = async (): Promise<boolean> => {
    if (!formData.file) {
      toast.error('Please select a file to upload');
      return false;
    }

    setLoading(true);

    try {
      const result = await noteService.updateNoteFile(noteId, formData.file);

      if (result.success) {
        toast.success('Note file updated successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to update note file');
        return false;
      }
    } catch (error) {
      console.error('Unexpected error during file update:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    loadingData,
    syllabusList,
    loadingSyllabus,
    handleInputChange,
    handleSubmit,
    handleFileOnlyUpdate,
  };
}
