import { apiClient } from '@/lib/api/apiClient';
import type {
    QuizAttemptApiResponse,
    PaginatedQueryParams,
} from '@/types/quiz.types';

interface QuizAttemptListResult {
    attempts: QuizAttemptApiResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isLast: boolean;
    error?: string;
}

function extractApiError(error: unknown, fallback: string): string {
    if (error !== null && typeof error === 'object') {
        const obj = error as Record<string, unknown>;
        if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
            return obj.message;
        }
    }

    return fallback;
}

class QuizAttemptService {
    private readonly endpoint = '/quiz-attempts';

    private buildQueryString(params: PaginatedQueryParams): string {
        const queryParams = new URLSearchParams();
        const sortDirection = params.sortDir ?? 'asc';
        const sortField = params.sortBy ?? 'attemptId';

        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());

        // Runtime compatibility: backend appears to require a concrete sort property.
        // Send Spring-style `sort=field,direction` in addition to the documented sortDir.
        queryParams.append('sort', `${sortField},${sortDirection}`);
        queryParams.append('sortDir', sortDirection);

        const qs = queryParams.toString();
        return qs ? `?${qs}` : '';
    }

    async getAttempts(params: PaginatedQueryParams = {}): Promise<QuizAttemptListResult> {
        try {
            const queryString = this.buildQueryString({
                page: 0,
                size: 10,
                sortDir: 'asc',
                ...params,
            });

            const response = await apiClient.get<{
                content: QuizAttemptApiResponse[];
                totalElements: number;
                totalPages: number;
                pageNumber: number;
                pageSize: number;
                last: boolean;
            }>(`${this.endpoint}${queryString}`);

            if (!response?.data) {
                return {
                    attempts: [],
                    totalElements: 0,
                    totalPages: 0,
                    currentPage: 0,
                    pageSize: params.size ?? 10,
                    isLast: true,
                    error: 'Invalid response from server',
                };
            }

            const { content, totalElements, totalPages, pageNumber, pageSize, last } = response.data;

            return {
                attempts: content,
                totalElements,
                totalPages,
                currentPage: pageNumber,
                pageSize,
                isLast: last,
            };
        } catch (error: unknown) {
            return {
                attempts: [],
                totalElements: 0,
                totalPages: 0,
                currentPage: 0,
                pageSize: params.size ?? 10,
                isLast: true,
                error: extractApiError(error, 'Failed to fetch quiz attempts'),
            };
        }
    }

    async deleteAttempt(id: number): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            await apiClient.delete(`${this.endpoint}/${id}`);
            return { success: true };
        } catch (error: unknown) {
            return {
                success: false,
                error: extractApiError(error, 'Failed to delete quiz attempt'),
            };
        }
    }
}

export const quizAttemptService = new QuizAttemptService();
