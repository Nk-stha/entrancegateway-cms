import { apiClient } from '@/lib/api/apiClient';
import type {
    EntranceTypeApiResponse,
    EntranceTypeFormData,
} from '@/types/quiz.types';
import type { ApiError } from '@/types/api.types';

class EntranceTypeService {
    private readonly endpoint = '/entrance-types';

    async getEntranceTypes(): Promise<EntranceTypeApiResponse[]> {
        try {
            const response = await apiClient.get<EntranceTypeApiResponse[]>(this.endpoint);

            if (!response || !response.data) {
                return [];
            }

            return response.data;
        } catch (error) {
            console.error('Failed to fetch entrance types:', error);
            return [];
        }
    }

    async createEntranceType(data: EntranceTypeFormData): Promise<{
        success: boolean;
        data?: EntranceTypeApiResponse;
        error?: string;
    }> {
        try {
            const response = await apiClient.post<EntranceTypeApiResponse>(this.endpoint, data);

            if (!response || !response.data) {
                return { success: false, error: 'Failed to create entrance type' };
            }

            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Failed to create entrance type:', apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to create entrance type',
            };
        }
    }

    async updateEntranceType(id: number, data: EntranceTypeFormData): Promise<{
        success: boolean;
        data?: EntranceTypeApiResponse;
        error?: string;
    }> {
        try {
            const response = await apiClient.put<EntranceTypeApiResponse>(`${this.endpoint}/${id}`, data);

            if (!response || !response.data) {
                return { success: false, error: 'Failed to update entrance type' };
            }

            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to update entrance type ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to update entrance type',
            };
        }
    }

    async deleteEntranceType(id: number): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            await apiClient.delete(`${this.endpoint}/${id}`);
            return { success: true };
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to delete entrance type ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to delete entrance type',
            };
        }
    }
}

export const entranceTypeService = new EntranceTypeService();
