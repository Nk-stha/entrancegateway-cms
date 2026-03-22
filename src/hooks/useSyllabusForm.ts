import { useState, useEffect } from 'react';
import { syllabusService } from '@/services/syllabus.service';
import { courseService } from '@/services/course.service';
import type { SyllabusFormData, CreateSyllabusRequest } from '@/types/syllabus.types';
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

export function useSyllabusForm() {
  const [formData, setFormData] = useState<SyllabusFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseApiResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const courseList = await courseService.getAllCourses();
        setCourses(courseList);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

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
      newErrors.courseId = 'Course ID is required';
    }

    const semester = parseInt(formData.semester, 10);
    if (!formData.semester || !isFinite(semester) || semester <= 0) {
      newErrors.semester = 'Semester must be greater than 0';
    }

    if (!formData.file) {
      newErrors.file = 'Syllabus file is required';
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
      const requestData: CreateSyllabusRequest = {
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

      const result = await syllabusService.createSyllabus(requestData, formData.file!);

      if (result.success) {
        toast.success('Syllabus created successfully');
        setFormData(initialFormData);
        setErrors({});
        return true;
      } else {
        toast.error(result.error || 'Failed to create syllabus');
        return false;
      }
    } catch (error) {
      console.error('Unexpected error during syllabus creation:', error);
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
    courses,
    loadingCourses,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
}
