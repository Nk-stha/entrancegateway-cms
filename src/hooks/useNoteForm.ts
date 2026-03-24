import { useState, useEffect } from 'react';
import { noteService } from '@/services/note.service';
import { syllabusService } from '@/services/syllabus.service';
import type { NoteFormData, CreateNoteRequest } from '@/types/note.types';
import type { Syllabus } from '@/types/syllabus.types';
import { toast } from '@/lib/utils/toast';

const initialFormData: NoteFormData = {
  noteName: '',
  noteDescription: '',
  syllabusId: '',
  file: null,
};

export function useNoteForm() {
  const [formData, setFormData] = useState<NoteFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoadingSyllabus(true);
      try {
        const result = await syllabusService.getSyllabusList({ page: 0, size: 1000 });
        setSyllabusList(result.syllabusList.content);
      } catch (error) {
        console.error('Failed to fetch syllabus:', error);
        toast.error('Failed to load syllabus list');
      } finally {
        setLoadingSyllabus(false);
      }
    };

    fetchSyllabus();
  }, []);

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

    if (!formData.noteName.trim()) {
      newErrors.noteName = 'Note name is required';
    }

    if (!formData.noteDescription.trim()) {
      newErrors.noteDescription = 'Note description is required';
    }

    const syllabusId = parseInt(formData.syllabusId, 10);
    if (!formData.syllabusId || !isFinite(syllabusId) || syllabusId <= 0) {
      newErrors.syllabusId = 'Syllabus is required';
    }

    if (!formData.file) {
      newErrors.file = 'Note file is required';
    } else if (formData.file.type !== 'application/pdf') {
      newErrors.file = 'Only PDF files are allowed';
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
      const requestData: CreateNoteRequest = {
        noteName: formData.noteName.trim(),
        noteDescription: formData.noteDescription.trim(),
        syllabusId: parseInt(formData.syllabusId, 10),
      };

      const result = await noteService.createNote(requestData, formData.file!);

      if (result.success) {
        toast.success('Note created successfully');
        setFormData(initialFormData);
        setErrors({});
        return true;
      } else {
        toast.error(result.error || 'Failed to create note');
        return false;
      }
    } catch (error) {
      console.error('Unexpected error during note creation:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return {
    formData,
    errors,
    loading,
    syllabusList,
    loadingSyllabus,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
}
