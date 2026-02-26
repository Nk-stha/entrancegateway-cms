import { useState, useEffect, useCallback, useRef } from 'react';
import { courseService } from '@/services/course.service';
import type { Course, PaginatedQueryParams } from '@/types/quiz.types';

export function useCourses(initialParams: PaginatedQueryParams = {}) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isLast, setIsLast] = useState(false);

    const paramsRef = useRef(initialParams);

    const fetchCourses = useCallback(async (params: PaginatedQueryParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await courseService.getCourses({
                ...paramsRef.current,
                ...params,
            });

            // Transform API response to UI type
            const transformedCourses: Course[] = result.courses.map(course => ({
                id: course.courseId,
                courseName: course.courseName,
                affiliation: course.affiliation,
                description: course.description,
                criteria: course.criteria,
                courseLevel: course.courseLevel,
                courseType: course.courseType,
            }));

            setCourses(transformedCourses);
            setTotalElements(result.totalElements);
            setTotalPages(result.totalPages);
            setCurrentPage(result.currentPage);
            setPageSize(result.pageSize);
            setIsLast(result.isLast);
        } catch {
            setError('Unable to load courses. Please try again later.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(() => {
        fetchCourses(paramsRef.current);
    }, [fetchCourses]);

    const goToPage = useCallback((page: number) => {
        fetchCourses({ ...paramsRef.current, page });
    }, [fetchCourses]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return { 
        courses, 
        loading, 
        error, 
        totalElements,
        totalPages,
        currentPage,
        pageSize,
        isLast,
        refetch, 
        goToPage 
    };
}
