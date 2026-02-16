import { apiClient } from '@/lib/api/apiClient';
import type { 
  TrainingListResponse, 
  TrainingQueryParams, 
  TrainingApiResponse,
  Training,
  TrainingCreateRequest,
  TrainingFormData
} from '@/types/training.types';
import type { ApiError } from '@/types/api.types';

class TrainingService {
  private readonly endpoint = '/trainings';

  // Transform API response to UI format
  private transformTraining(apiTraining: TrainingApiResponse): Training {
    return {
      id: apiTraining.trainingId,
      name: apiTraining.trainingName,
      courseCode: `EG-${apiTraining.trainingCategory.substring(0, 3).toUpperCase()}-${apiTraining.trainingId}`,
      category: apiTraining.trainingCategory.toLowerCase(),
      schedule: {
        startDate: this.formatDate(apiTraining.startDate),
        endDate: this.formatDate(apiTraining.endDate),
      },
      status: this.mapStatus(apiTraining.trainingStatus),
      capacity: {
        enrolled: apiTraining.currentParticipants,
        total: apiTraining.maxParticipants,
      },
      price: apiTraining.price,
    };
  }

  // Map API status to UI status
  private mapStatus(apiStatus: string): 'registration_open' | 'upcoming' | 'closed' {
    const statusMap: Record<string, 'registration_open' | 'upcoming' | 'closed'> = {
      'REGISTRATION_OPEN': 'registration_open',
      'UPCOMING': 'upcoming',
      'CLOSED': 'closed',
    };
    return statusMap[apiStatus] || 'upcoming';
  }

  // Format date from YYYY-MM-DD to readable format
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  // Build query string from params
  private buildQueryString(params: TrainingQueryParams): string {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortDir) {
      queryParams.append('sortDir', params.sortDir);
    }

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Get list of trainings with pagination
  async getTrainings(params: TrainingQueryParams = {}): Promise<{
    trainings: Training[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isLast: boolean;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<{
        content: TrainingApiResponse[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
        isLast: boolean;
      }>(`${this.endpoint}${queryString}`);

      if (!response || !response.data) {
        throw new Error('Invalid response format');
      }

      const { content, totalElements, totalPages, pageNumber, pageSize, isLast } = response.data;

      return {
        trainings: content.map((training: TrainingApiResponse) => this.transformTraining(training)),
        totalElements,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        isLast,
      };
    } catch (error) {
      const apiError = error as ApiError;
      
      console.error('Failed to fetch trainings:', apiError);

      return {
        trainings: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params.size || 10,
        isLast: true,
      };
    }
  }

  // Get single training by ID
  async getTrainingById(id: number): Promise<TrainingApiResponse | null> {
    try {
      const response = await apiClient.get<TrainingApiResponse>(`${this.endpoint}/${id}`);

      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to fetch training ${id}:`, apiError);
      return null;
    }
  }

  // Transform form data to API request format
  private transformFormToApi(formData: TrainingFormData): TrainingCreateRequest {
    // Map UI type to API type
    const typeMap: Record<string, 'REMOTE' | 'ONSITE' | 'HYBRID'> = {
      'online': 'REMOTE',
      'onsite': 'ONSITE',
      'hybrid': 'HYBRID',
    };

    return {
      trainingName: formData.name,
      description: formData.description,
      syllabusDescription: formData.syllabus,
      startDate: formData.startDate,
      endDate: formData.endDate,
      trainingType: typeMap[formData.type] || 'HYBRID',
      trainingStatus: 'UPCOMING',
      trainingHours: formData.hours,
      location: formData.location,
      maxParticipants: formData.maxParticipants,
      currentParticipants: 0,
      trainingCategory: formData.category,
      price: formData.price,
      certificateProvided: formData.certificateProvided,
      remarks: formData.remarks || undefined,
      offerPercentage: formData.offerPercentage || undefined,
    };
  }

  // Create new training with multipart/form-data
  async createTraining(formData: TrainingFormData): Promise<{
    success: boolean;
    data?: TrainingApiResponse;
    error?: string;
    fieldErrors?: Record<string, string>;
  }> {
    try {
      const multipartData = new FormData();

      const trainingRequest = this.transformFormToApi(formData);
      const trainingBlob = new Blob([JSON.stringify(trainingRequest)], {
        type: 'application/json',
      });
      multipartData.append('training', trainingBlob);

      if (formData.file) {
        multipartData.append('file', formData.file);
      }

      const response = await apiClient.postMultipart<TrainingApiResponse>(this.endpoint, multipartData);

      if (!response || !response.data) {
        return {
          success: false,
          error: 'Failed to create training',
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to create training:', apiError);

      if (apiError.status === 400 && apiError.errors) {
        return {
          success: false,
          error: apiError.message || 'Validation failed',
          fieldErrors: apiError.errors as Record<string, string>,
        };
      }

      if (apiError.status === 409) {
        return {
          success: false,
          error: apiError.message || 'Training already exists',
        };
      }

      return {
        success: false,
        error: apiError.message || 'Failed to create training',
      };
    }
  }

  // Update existing training with multipart/form-data
  async updateTraining(
    id: number, 
    formData: TrainingFormData
  ): Promise<{
    success: boolean;
    data?: TrainingApiResponse;
    error?: string;
    fieldErrors?: Record<string, string>;
  }> {
    try {
      const multipartData = new FormData();

      const trainingRequest = this.transformFormToApi(formData);
      const trainingBlob = new Blob([JSON.stringify(trainingRequest)], {
        type: 'application/json',
      });
      multipartData.append('training', trainingBlob);

      if (formData.file) {
        multipartData.append('file', formData.file);
      }

      const response = await apiClient.putMultipart<TrainingApiResponse>(
        `${this.endpoint}/${id}`,
        multipartData
      );

      if (!response || !response.data) {
        return {
          success: false,
          error: 'Failed to update training',
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to update training ${id}:`, apiError);

      if (apiError.status === 404) {
        return {
          success: false,
          error: apiError.message || 'Training not found',
        };
      }

      if (apiError.status === 400 && apiError.errors) {
        return {
          success: false,
          error: apiError.message || 'Validation failed',
          fieldErrors: apiError.errors as Record<string, string>,
        };
      }

      return {
        success: false,
        error: apiError.message || 'Failed to update training',
      };
    }
  }

  // Delete training
  async deleteTraining(id: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);

      return {
        success: true,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to delete training ${id}:`, apiError);

      if (apiError.status === 404) {
        return {
          success: false,
          error: 'Training not found',
        };
      }

      return {
        success: false,
        error: apiError.message || 'Failed to delete training',
      };
    }
  }
}

export const trainingService = new TrainingService();
