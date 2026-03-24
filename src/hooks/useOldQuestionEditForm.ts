import { useState, useEffect } from 'react';
import { oldQuestionService } from '@/services/oldQuestion.service';
import { syllabusService } from '@/services/syllabus.service';
import { courseService } from '@/services/course.service';
import type { OldQuestionFormData, UpdateOldQuestionRequest } from '@/types/oldQuestion.types';
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

export function useOldQuestionEditForm(oldQuestionId: number) {
  const [formData, setFormData] = useState<OldQuestionFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [coursesList, setCoursesList] = useState<CourseApiResponse[]>([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (oldQuestionId <= 0) {
      setLoadingData(false);
      setLoadingSyllabus(false);
      setLoadingCourses(false);
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      setLoadingSyllabus(true);
      setLoadingCourses(true);

      try {
        const [oldQuestionResult, syllabusResult, courseList] = await Promise.all([
          oldQuestionService.getOldQuestionById(oldQuestionId),
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

        if (oldQuestionResult.error) {
          toast.error(oldQuestionResult.error);
          setLoadingData(false);
          setLoadingSyllabus(false);
          setLoadingCourses(false);
          return;
        }

        if (oldQuestionResult.oldQuestion) {
          const oldQuestion = oldQuestionResult.oldQuestion;
          
          let foundCourseId = '';
          if (courseList && courseList.length > 0 && oldQuestion.courseName) {
            const matchingCourse = courseList.find(c => 
              c.courseName.toLowerCase().trim() === oldQuestion.courseName.toLowerCase().trim()
            );
            if (matchingCourse) {
              foundCourseId = matchingCourse.courseId.toString();
            } else {
              console.warn(`Could not find matching course for: ${oldQuestion.courseName}`);
            }
          }
          
          setFormData({
            setName: oldQuestion.setName,
            description: oldQuestion.description,
            year: oldQuestion.year.toString(),
            syllabusId: oldQuestion.syllabusId.toString(),
            courseId: foundCourseId,
            file: null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch old question data:', error);
        toast.error('Failed to load old question data');
      } finally {
        setLoadingData(false);
        setLoadingSyllabus(false);
        setLoadingCourses(false);
      }
    };

    fetchData();
  }, [oldQuestionId]);

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
      const requestData: UpdateOldQuestionRequest = {
        setName: formData.setName.trim(),
        description: formData.description.trim(),
        year: parseInt(formData.year, 10),
        syllabusId: parseInt(formData.syllabusId, 10),
        courseId: parseInt(formData.courseId, 10),
      };

      const result = await oldQuestionService.updateOldQuestion(
        oldQuestionId,
        requestData,
        formData.file || undefined
      );

      if (result.success) {
        toast.success('Old question updated successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to update old question');
        if (result.error) {
          setErrors(prev => ({ ...prev, general: result.error || 'Failed to update old question' }));
        }
        return false;
      }
    } catch (error) {
      console.error('Unexpected error during old question update:', error);
      const errorMessage = 'An unexpected error occurred';
      toast.error(errorMessage);
      setErrors(prev => ({ ...prev, general: errorMessage }));
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
    coursesList,
    loadingSyllabus,
    loadingCourses,
    handleInputChange,
    handleSubmit,
  };
}
