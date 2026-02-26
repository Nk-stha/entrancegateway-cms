import { apiClient } from '@/lib/api/apiClient';
import type {
    QuestionSetApiResponse,
    QuestionSetFormData,
    PaginatedQueryParams,
} from '@/types/quiz.types';
import type { ApiError } from '@/types/api.types';

class QuestionSetService {
    private readonly endpoint = '/question-sets';

    private buildQueryString(params: PaginatedQueryParams & { courseId?: number; entranceTypeId?: number }): string {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortDir) queryParams.append('sortDir', params.sortDir);
        if (params.courseId !== undefined) queryParams.append('courseId', params.courseId.toString());
        if (params.entranceTypeId !== undefined) queryParams.append('entranceTypeId', params.entranceTypeId.toString());
        const qs = queryParams.toString();
        return qs ? `?${qs}` : '';
    }

    async getQuestionSets(params: PaginatedQueryParams & { courseId?: number; entranceTypeId?: number } = {}): Promise<{
        questionSets: QuestionSetApiResponse[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        isLast: boolean;
    }> {
        try {
            const queryString = this.buildQueryString(params);
            const response = await apiClient.get<{
                content: QuestionSetApiResponse[];
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
                questionSets: content,
                totalElements,
                totalPages,
                currentPage: pageNumber,
                pageSize,
                isLast: last,
            };
        } catch (error) {
            console.error('Failed to fetch question sets:', error);
            return {
                questionSets: [],
                totalElements: 0,
                totalPages: 0,
                currentPage: 0,
                pageSize: params.size || 10,
                isLast: true,
            };
        }
    }

    async getQuestionSetById(id: number): Promise<QuestionSetApiResponse | null> {
        try {
            const response = await apiClient.get<QuestionSetApiResponse>(`${this.endpoint}/${id}`);

            if (!response || !response.data) {
                console.error('Failed to fetch question set: Invalid response');
                return null;
            }

            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to fetch question set ${id}:`, apiError);
            return null;
        }
    }

    async createQuestionSet(data: QuestionSetFormData): Promise<boolean> {
        try {
            const response = await apiClient.post<QuestionSetApiResponse>(this.endpoint, data);

            if (!response || !response.data) {
                console.error('Failed to create question set: Invalid response');
                return false;
            }

            return true;
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Failed to create question set:', apiError);
            return false;
        }
    }

    async updateQuestionSet(id: number, data: QuestionSetFormData): Promise<boolean> {
        try {
            const response = await apiClient.put<QuestionSetApiResponse>(`${this.endpoint}/${id}`, data);

            if (!response || !response.data) {
                console.error('Failed to update question set: Invalid response');
                return false;
            }

            return true;
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to update question set ${id}:`, apiError);
            return false;
        }
    }

    async deleteQuestionSet(id: number): Promise<boolean> {
        try {
            await apiClient.delete(`${this.endpoint}/${id}`);
            return true;
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to delete question set ${id}:`, apiError);
            return false;
        }
    }
}

export const questionSetService = new QuestionSetService();
