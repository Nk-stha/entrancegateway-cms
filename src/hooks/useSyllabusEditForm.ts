import { useState, useEffect } from 'react';
import { syllabusService } from '@/services/syllabus.service';
import { courseService } from '@/services/course.service';
import type { SyllabusFormData, UpdateSyllabusRequest, Syllabus } from '@/types/syllabus.types';
import type { CourseApiResponse } from '@/types/quiz.types';
import { toast } from '@/lib/utils/toast';

const initialFormData: SyllabusFormData = {
  syllabusTitle: '',
  subjectName: '',
  courseCode: '',
  creditHours: '',
  lectureHours: '',
  practicalHours: '',
  courseId: '',
  semester: '',
  year: '',
  file: null,
};

export function useSyllabusEditForm(syllabusId: number) {
  const [formData, setFormData] = useState<SyllabusFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [courses, setCourses] = useState<CourseApiResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setLoadingCourses(true);

      try {
        const [syllabusResult, courseList] = await Promise.all([
          syllabusService.getSyllabusById(syllabusId),
          courseService.getAllCourses(),
        ]);

        if (syllabusResult.error) {
          toast.error(syllabusResult.error);
          return;
        }

        if (syllabusResult.syllabus) {
          const syllabus = syllabusResult.syllabus;
          setFormData({
            syllabusTitle: syllabus.syllabusTitle,
            subjectName: syllabus.subjectName,
            courseCode: syllabus.courseCode,
            creditHours: syllabus.creditHours.toString(),
            lectureHours: syllabus.lectureHours.toString(),
            practicalHours: syllabus.practicalHours.toString(),
            courseId: syllabus.courseId.toString(),
            semester: syllabus.semester.toString(),
            year: syllabus.year ? syllabus.year.toString() : '',
            file: null,
          });
        }

        setCourses(courseList);
      } catch (error) {
        console.error('Failed to fetch syllabus data:', error);
        toast.error('Failed to load syllabus data');
      } finally {
        setLoadingData(false);
        setLoadingCourses(false);
      }
    };

    fetchData();
  }, [syllabusId]);

  const handleInputChange = (field: keyof SyllabusFormData, value: string | File | null) => {
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

    if (!formData.syllabusTitle.trim()) {
      newErrors.syllabusTitle = 'Syllabus title is required';
    }

    if (!formData.subjectName.trim()) {
      newErrors.subjectName = 'Subject name is required';
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    }

    const creditHours = parseFloat(formData.creditHours);
    if (!formData.creditHours || !isFinite(creditHours) || creditHours <= 0) {
      newErrors.creditHours = 'Credit hours must be greater than 0';
    }

    const lectureHours = parseInt(formData.lectureHours, 10);
    if (formData.lectureHours === '' || !isFinite(lectureHours) || lectureHours < 0) {
      newErrors.lectureHours = 'Lecture hours cannot be negative';
    }

    const practicalHours = parseInt(formData.practicalHours, 10);
    if (formData.practicalHours === '' || !isFinite(practicalHours) || practicalHours < 0) {
      newErrors.practicalHours = 'Practical hours cannot be negative';
    }

    const courseId = parseInt(formData.courseId, 10);
    if (!formData.courseId || !isFinite(courseId) || courseId <= 0) {
      newErrors.courseId = 'Course is required';
    }

    const semester = parseInt(formData.semester, 10);
    if (!formData.semester || !isFinite(semester) || semester <= 0) {
      newErrors.semester = 'Semester must be greater than 0';
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
      const requestData: UpdateSyllabusRequest = {
        syllabusTitle: formData.syllabusTitle.trim(),
        subjectName: formData.subjectName.trim(),
        courseCode: formData.courseCode.trim(),
        creditHours: parseFloat(formData.creditHours),
        lectureHours: parseInt(formData.lectureHours, 10),
        practicalHours: parseInt(formData.practicalHours, 10),
        courseId: parseInt(formData.courseId, 10),
        semester: parseInt(formData.semester, 10),
        year: formData.year ? parseInt(formData.year, 10) : null,
      };

      let result;
      if (formData.file) {
        result = await syllabusService.updateSyllabusWithFile(syllabusId, requestData, formData.file);
      } else {
        result = await syllabusService.updateSyllabus(syllabusId, requestData);
      }

      if (result.success) {
        toast.success('Syllabus updated successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to update syllabus');
        return false;
      }
    } catch (error) {
      console.error('Unexpected error during syllabus update:', error);
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
      const result = await syllabusService.updateSyllabusFile(syllabusId, formData.file);

      if (result.success) {
        toast.success('Syllabus file updated successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to update syllabus file');
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
    courses,
    loadingCourses,
    handleInputChange,
    handleSubmit,
    handleFileOnlyUpdate,
  };
}
