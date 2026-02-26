import { apiClient } from '@/lib/api/apiClient';
import type {
    CategoryApiResponse,
    CategoryFormData,
    PaginatedQueryParams,
} from '@/types/quiz.types';
import type { ApiError } from '@/types/api.types';

class CategoryService {
    private readonly endpoint = '/categories';

    private buildQueryString(params: PaginatedQueryParams): string {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortDir) queryParams.append('sortDir', params.sortDir);
        const qs = queryParams.toString();
        return qs ? `?${qs}` : '';
    }

    async getCategories(params: PaginatedQueryParams = {}): Promise<{
        categories: CategoryApiResponse[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        isLast: boolean;
    }> {
        try {
            const queryString = this.buildQueryString({
                sortBy: 'categoryName',
                sortDir: 'asc',
                ...params,
            });
            const response = await apiClient.get<{
                content: CategoryApiResponse[];
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
                categories: content,
                totalElements,
                totalPages,
                currentPage: pageNumber,
                pageSize,
                isLast: last,
            };
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            return {
                categories: [],
                totalElements: 0,
                totalPages: 0,
                currentPage: 0,
                pageSize: params.size || 10,
                isLast: true,
            };
        }
    }

    async createCategory(data: CategoryFormData): Promise<{
        success: boolean;
        data?: CategoryApiResponse;
        error?: string;
    }> {
        try {
            const response = await apiClient.post<CategoryApiResponse>(this.endpoint, data);

            if (!response || !response.data) {
                return { success: false, error: 'Failed to create category' };
            }

            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Failed to create category:', apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to create category',
            };
        }
    }

    async updateCategory(id: number, data: CategoryFormData): Promise<{
        success: boolean;
        data?: CategoryApiResponse;
        error?: string;
    }> {
        try {
            const response = await apiClient.put<CategoryApiResponse>(`${this.endpoint}/${id}`, data);

            if (!response || !response.data) {
                return { success: false, error: 'Failed to update category' };
            }

            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to update category ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to update category',
            };
        }
    }

    async deleteCategory(id: number): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            await apiClient.delete(`${this.endpoint}/${id}`);
            return { success: true };
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to delete category ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to delete category',
            };
        }
    }
}

export const categoryService = new CategoryService();
