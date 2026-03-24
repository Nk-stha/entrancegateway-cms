import { useState, useEffect } from 'react';
import { oldQuestionService } from '@/services/oldQuestion.service';
import { syllabusService } from '@/services/syllabus.service';
import { courseService } from '@/services/course.service';
import type { OldQuestionFormData, CreateOldQuestionRequest } from '@/types/oldQuestion.types';
import type { Syllabus } from '@/types/syllabus.types';
import type { CourseApiResponse } from '@/types/quiz.types';
import { toast } from '@/lib/utils/toast';

const initialFormData: OldQuestionFormData = {
  setName: '',
  description: '',
  year: '',
  syllabusId: '',
  courseId: '',
  file: null,
};

export function useOldQuestionForm() {
  const [formData, setFormData] = useState<OldQuestionFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [coursesList, setCoursesList] = useState<CourseApiResponse[]>([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingSyllabus(true);
      setLoadingCourses(true);

      try {
        const [syllabusResult, courseList] = await Promise.all([
          syllabusService.getSyllabusList({ page: 0, size: 1000 }),
          courseService.getAllCourses(),
        ]);

        if (syllabusResult.error) {
          console.error('Failed to fetch syllabus list:', syllabusResult.error);
          toast.error(syllabusResult.error);
        } else if (syllabusResult.syllabusList?.content) {
          setSyllabusList(syllabusResult.syllabusList.content);
        }

        if (courseList && courseList.length > 0) {
          setCoursesList(courseList);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load form data');
      } finally {
        setLoadingSyllabus(false);
        setLoadingCourses(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof OldQuestionFormData, value: string | File | null) => {
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

    if (!formData.setName.trim()) {
      newErrors.setName = 'Set name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const year = parseInt(formData.year, 10);
    if (!formData.year || !isFinite(year) || year <= 0) {
      newErrors.year = 'Valid year is required';
    }

    const syllabusId = parseInt(formData.syllabusId, 10);
    if (!formData.syllabusId || !isFinite(syllabusId) || syllabusId <= 0) {
      newErrors.syllabusId = 'Syllabus is required';
    }

    const courseId = parseInt(formData.courseId, 10);
    if (!formData.courseId || !isFinite(courseId) || courseId <= 0) {
      newErrors.courseId = 'Course is required';
    }

    if (!formData.file) {
      newErrors.file = 'PDF file is required';
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
      const requestData: CreateOldQuestionRequest = {
        setName: formData.setName.trim(),
        description: formData.description.trim(),
        year: parseInt(formData.year, 10),
        syllabusId: parseInt(formData.syllabusId, 10),
        courseId: parseInt(formData.courseId, 10),
      };

      const result = await oldQuestionService.createOldQuestion(requestData, formData.file!);

      if (result.success) {
        toast.success('Old question created successfully');
        setFormData(initialFormData);
        setErrors({});
        return true;
      } else {
        toast.error(result.error || 'Failed to create old question');
        if (result.error) {
          setErrors(prev => ({ ...prev, general: result.error || 'Failed to create old question' }));
        }
        return false;
      }
    } catch (error) {
      console.error('Unexpected error during old question creation:', error);
      const errorMessage = 'An unexpected error occurred';
      toast.error(errorMessage);
      setErrors(prev => ({ ...prev, general: errorMessage }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.value = '';
      }
    });
  };

  return {
    formData,
    errors,
    loading,
    syllabusList,
    coursesList,
    loadingSyllabus,
    loadingCourses,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
}
