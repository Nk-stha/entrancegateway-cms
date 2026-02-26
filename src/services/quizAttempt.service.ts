import { apiClient } from '@/lib/api/apiClient';
import type {
    QuizAttemptApiResponse,
    PaginatedQueryParams,
} from '@/types/quiz.types';
import type { ApiError } from '@/types/api.types';

class QuizAttemptService {
    private readonly endpoint = '/quiz-attempts';

    private buildQueryString(params: PaginatedQueryParams): string {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortDir) queryParams.append('sortDir', params.sortDir);
        const qs = queryParams.toString();
        return qs ? `?${qs}` : '';
    }

    async getAttempts(params: PaginatedQueryParams = {}): Promise<{
        attempts: QuizAttemptApiResponse[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        isLast: boolean;
    }> {
        try {
            const queryString = this.buildQueryString({
                sortDir: 'desc',
                ...params,
            });
            console.log('Fetching quiz attempts from:', `${this.endpoint}${queryString}`);
            const response = await apiClient.get<{
                content: QuizAttemptApiResponse[];
                totalElements: number;
                totalPages: number;
                pageNumber: number;
                pageSize: number;
                last: boolean;
            }>(`${this.endpoint}${queryString}`);

            if (!response || !response.data) {
                throw new Error('Invalid response format');
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
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Failed to fetch quiz attempts:', apiError);
            console.error('Error details:', {
                message: apiError.message,
                errors: apiError.errors,
                status: apiError.status,
            });
            return {
                attempts: [],
                totalElements: 0,
                totalPages: 0,
                currentPage: 0,
                pageSize: params.size || 20,
                isLast: true,
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
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to delete quiz attempt ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to delete quiz attempt',
            };
        }
    }
}

export const quizAttemptService = new QuizAttemptService();
