import { useState, useEffect, useCallback, useRef } from 'react';
import { quizAttemptService } from '@/services/quizAttempt.service';
import type { QuizAttemptApiResponse, PaginatedQueryParams } from '@/types/quiz.types';

export function useQuizAttempts(initialParams: PaginatedQueryParams = { size: 20 }) {
    const [attempts, setAttempts] = useState<QuizAttemptApiResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 20,
        isLast: false,
    });

    const paramsRef = useRef(initialParams);

    const fetchAttempts = useCallback(async (params: PaginatedQueryParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const result = await quizAttemptService.getAttempts({
                ...paramsRef.current,
                ...params,
            });

            setAttempts(result.attempts);
            setPagination({
                totalElements: result.totalElements,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                pageSize: result.pageSize,
                isLast: result.isLast,
            });
        } catch {
            setError('Unable to load quiz attempts. Please try again later.');
            setAttempts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(() => {
        fetchAttempts(paramsRef.current);
    }, [fetchAttempts]);

    const goToPage = useCallback((page: number) => {
        fetchAttempts({ ...paramsRef.current, page });
    }, [fetchAttempts]);

    useEffect(() => {
        fetchAttempts();
    }, [fetchAttempts]);

    return { attempts, loading, error, pagination, refetch, goToPage };
}
