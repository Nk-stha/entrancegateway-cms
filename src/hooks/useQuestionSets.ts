import { useState, useEffect, useCallback, useRef } from 'react';
import { questionSetService } from '@/services/questionSet.service';
import type { QuestionSet, PaginatedQueryParams } from '@/types/quiz.types';

interface QuestionSetParams extends PaginatedQueryParams {
    courseId?: number;
    entranceTypeId?: number;
}

export function useQuestionSets(initialParams: QuestionSetParams = {}) {
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isLast, setIsLast] = useState(false);

    const paramsRef = useRef(initialParams);

    const fetchQuestionSets = useCallback(async (params: QuestionSetParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await questionSetService.getQuestionSets({
                ...paramsRef.current,
                ...params,
            });

            // Transform API response to UI type
            const transformedSets: QuestionSet[] = result.questionSets
                .filter(set => {
                    // Filter out invalid entries
                    if (!set || set.questionSetId === undefined || set.questionSetId === null) {
                        console.warn('Invalid question set entry:', set);
                        return false;
                    }
                    return true;
                })
                .map(set => ({
                    id: set.questionSetId!,
                    setName: set.setName || 'Untitled Set',
                    nosOfQuestions: set.nosOfQuestions || 0,
                    duration: set.durationInMinutes ? `PT${set.durationInMinutes}M` : null,
                    description: set.description || '',
                    price: set.price || 0,
                    course: set.courseId && set.courseName ? {
                        id: set.courseId,
                        courseName: set.courseName,
                    } : null,
                    entranceType: set.entranceTypeId && set.entranceTypeName ? {
                        id: set.entranceTypeId,
                        entranceName: set.entranceTypeName,
                    } : null,
                }));

            setQuestionSets(transformedSets);
            setTotalElements(result.totalElements);
            setTotalPages(result.totalPages);
            setCurrentPage(result.currentPage);
            setPageSize(result.pageSize);
            setIsLast(result.isLast);
        } catch {
            setError('Unable to load question sets. Please try again later.');
            setQuestionSets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(() => {
        fetchQuestionSets(paramsRef.current);
    }, [fetchQuestionSets]);

    const goToPage = useCallback((page: number) => {
        fetchQuestionSets({ ...paramsRef.current, page });
    }, [fetchQuestionSets]);

    useEffect(() => {
        paramsRef.current = initialParams;
        fetchQuestionSets();
    }, [fetchQuestionSets, initialParams.courseId, initialParams.entranceTypeId]);

    return { 
        questionSets, 
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
