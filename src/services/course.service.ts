import { apiClient } from '@/lib/api/apiClient';
import type {
    CourseApiResponse,
    CourseFormData,
    PaginatedQueryParams,
} from '@/types/quiz.types';
import type { ApiError } from '@/types/api.types';

class CourseService {
    private readonly endpoint = '/courses';

    private buildQueryString(params: PaginatedQueryParams): string {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.size !== undefined) queryParams.append('size', params.size.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortDir) queryParams.append('sortDir', params.sortDir);
        const qs = queryParams.toString();
        return qs ? `?${qs}` : '';
    }

    async getCourses(params: PaginatedQueryParams = {}): Promise<{
        courses: CourseApiResponse[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        isLast: boolean;
    }> {
        try {
            const queryString = this.buildQueryString(params);
            const response = await apiClient.get<{
                content: CourseApiResponse[];
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
                courses: content,
                totalElements,
                totalPages,
                currentPage: pageNumber,
                pageSize,
                isLast: last,
            };
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            return {
                courses: [],
                totalElements: 0,
                totalPages: 0,
                currentPage: 0,
                pageSize: params.size || 10,
                isLast: true,
            };
        }
    }

    /** Fetch ALL courses (unpaginated) for dropdown selectors */
    async getAllCourses(): Promise<CourseApiResponse[]> {
        try {
            const response = await apiClient.get<{
                content: CourseApiResponse[];
            }>(`${this.endpoint}?page=0&size=100`);

            if (!response || !response.data) return [];
            return response.data.content;
        } catch (error) {
            console.error('Failed to fetch all courses:', error);
            return [];
        }
    }

    async createCourse(data: CourseFormData): Promise<{
        success: boolean;
        data?: CourseApiResponse;
        error?: string;
    }> {
        try {
            const response = await apiClient.post<CourseApiResponse>(this.endpoint, data);

            if (!response || !response.data) {
                return { success: false, error: 'Failed to create course' };
            }

            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Failed to create course:', apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to create course',
            };
        }
    }

    async updateCourse(id: number, data: CourseFormData): Promise<{
        success: boolean;
        data?: CourseApiResponse;
        error?: string;
    }> {
        try {
            const response = await apiClient.put<CourseApiResponse>(`${this.endpoint}/${id}`, data);

            if (!response || !response.data) {
                return { success: false, error: 'Failed to update course' };
            }

            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to update course ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to update course',
            };
        }
    }

    async deleteCourse(id: number): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            await apiClient.delete(`${this.endpoint}/${id}`);
            return { success: true };
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to delete course ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to delete course',
            };
        }
    }
}

export const courseService = new CourseService();
