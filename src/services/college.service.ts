import { apiClient } from '@/lib/api/apiClient';
import { toast } from '@/lib/utils/toast';
import type {
  College,
  CollegeApiResponse,
  CollegeFormData,
  CollegeCreateRequest,
  CollegeQueryParams,
} from '@/types/college.types';
import type { ApiError } from '@/types/api.types';

interface CollegesResponse {
  success: boolean;
  colleges: College[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  error?: string;
}

interface CollegeCreateResponse {
  success: boolean;
  college?: College;
  error?: string;
  errorType?: 'conflict' | 'unauthorized' | 'validation' | 'network' | 'unknown';
}

class CollegeService {
  private endpoint = '/colleges';

  private transformCollege(apiCollege: CollegeApiResponse): College {
    return {
      collegeId: apiCollege.collegeId,
      collegeName: apiCollege.collegeName,
      location: apiCollege.location,
      affiliation: apiCollege.affiliation,
      website: apiCollege.website,
      contact: apiCollege.contact,
      email: apiCollege.email,
      description: apiCollege.description,
      establishedYear: apiCollege.establishedYear,
      collegeType: apiCollege.collegeType,
      priority: apiCollege.priority,
      logoName: apiCollege.logoName,
      latitude: apiCollege.latitude,
      longitude: apiCollege.longitude,
      collegePictureName: apiCollege.collegePictureName,
      courses: apiCollege.courses,
    };
  }

  async getColleges(params: CollegeQueryParams): Promise<CollegesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDir) queryParams.append('sortDir', params.sortDir);

      const response = await apiClient.get<{
        content: CollegeApiResponse[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
        isLast: boolean;
      }>(`${this.endpoint}?${queryParams.toString()}`);

      if (!response.data) {
        console.error('Colleges: No data received from server');
        return {
          success: false,
          colleges: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          error: 'No data received from server',
        };
      }

      return {
        success: true,
        colleges: response.data.content.map((college: CollegeApiResponse) =>
          this.transformCollege(college)
        ),
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.pageNumber,
      };
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
      return {
        success: false,
        colleges: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch colleges',
      };
    }
  }

  async getCollegeById(id: number): Promise<College | null> {
    try {
      const response = await apiClient.get<CollegeApiResponse>(`${this.endpoint}/${id}`);

      if (!response.data) {
        console.error(`College ${id}: No data received from server`);
        return null;
      }

      return this.transformCollege(response.data);
    } catch (error) {
      console.error(`Failed to fetch college ${id}:`, error);
      return null;
    }
  }

  async createCollege(data: CollegeFormData): Promise<CollegeCreateResponse> {
    try {
      const formData = new FormData();

      // Create the college JSON payload
      const collegePayload: CollegeCreateRequest = {
        collegeName: data.collegeName,
        email: data.email,
        location: data.location,
        collegeType: data.collegeType,
        affiliation: data.affiliation,
        priority: data.priority,
      };

      // Add optional fields
      if (data.description) collegePayload.description = data.description;
      if (data.website) collegePayload.website = data.website;
      if (data.contact) collegePayload.contact = data.contact;
      if (data.establishedYear) collegePayload.establishedYear = data.establishedYear;

      // Validate coordinates - both must be provided or both null
      if (data.latitude !== undefined && data.longitude !== undefined) {
        collegePayload.latitude = data.latitude;
        collegePayload.longitude = data.longitude;
      } else if (data.latitude !== undefined || data.longitude !== undefined) {
        toast.error('Both latitude and longitude must be provided together');
        return {
          success: false,
          error: 'Both latitude and longitude must be provided together',
          errorType: 'validation',
        };
      }

      // Add college data as JSON blob
      const collegeBlob = new Blob([JSON.stringify(collegePayload)], { type: 'application/json' });
      formData.append('college', collegeBlob);

      // Add logo file (required)
      if (!data.logo) {
        toast.error('College logo is required');
        return {
          success: false,
          error: 'College logo is required',
          errorType: 'validation',
        };
      }
      formData.append('logo', data.logo);

      // Add gallery images (required)
      if (!data.images || data.images.length === 0) {
        toast.error('At least one gallery image is required');
        return {
          success: false,
          error: 'At least one gallery image is required',
          errorType: 'validation',
        };
      }
      data.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await apiClient.postMultipart<CollegeApiResponse>(
        this.endpoint,
        formData,
        60000
      );

      if (!response.data) {
        console.error('Create college: No data received from server');
        return {
          success: false,
          error: 'No data received from server',
          errorType: 'unknown',
        };
      }

      toast.success('College created successfully');
      return {
        success: true,
        college: this.transformCollege(response.data),
      };
    } catch (error) {
      console.error('Failed to create college:', error);

      const apiError = error as ApiError;

      // Handle specific error types
      if (apiError.status === 409) {
        const errorMessage = apiError.message || 'College already exists';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'conflict',
        };
      }

      if (apiError.status === 401 || apiError.status === 403) {
        const errorMessage = 'You do not have permission to create colleges';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'unauthorized',
        };
      }

      if (apiError.status === 400) {
        const errorMessage = apiError.message || 'Invalid college data';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'validation',
        };
      }

      if (apiError.status === 408 || apiError.message === 'Request timeout') {
        const errorMessage = 'Request timeout. Please try again.';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'network',
        };
      }

      // Generic error
      const errorMessage = apiError.message || 'Failed to create college';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorType: 'unknown',
      };
    }
  }

  async updateCollege(id: number, data: CollegeFormData): Promise<CollegeCreateResponse> {
    try {
      const formData = new FormData();

      // Create the college JSON payload
      const collegePayload: CollegeCreateRequest = {
        collegeName: data.collegeName,
        email: data.email,
        location: data.location,
        collegeType: data.collegeType,
        affiliation: data.affiliation,
        priority: data.priority,
      };

      // Add optional fields
      if (data.description) collegePayload.description = data.description;
      if (data.website) collegePayload.website = data.website;
      if (data.contact) collegePayload.contact = data.contact;
      if (data.establishedYear) collegePayload.establishedYear = data.establishedYear;

      // Validate coordinates - both must be provided or both null
      if (data.latitude !== undefined && data.longitude !== undefined) {
        collegePayload.latitude = data.latitude;
        collegePayload.longitude = data.longitude;
      } else if (data.latitude !== undefined || data.longitude !== undefined) {
        toast.error('Both latitude and longitude must be provided together');
        return {
          success: false,
          error: 'Both latitude and longitude must be provided together',
          errorType: 'validation',
        };
      }

      // Add college data as JSON blob
      const collegeBlob = new Blob([JSON.stringify(collegePayload)], { type: 'application/json' });
      formData.append('college', collegeBlob);

      // Add logo file if provided (optional for update)
      if (data.logo) {
        formData.append('logo', data.logo);
      }

      // Add gallery images if provided (optional for update - appends to existing)
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await apiClient.putMultipart<CollegeApiResponse>(
        `${this.endpoint}/${id}`,
        formData,
        60000
      );

      if (!response.data) {
        console.error(`Update college ${id}: No data received from server`);
        return {
          success: false,
          error: 'No data received from server',
          errorType: 'unknown',
        };
      }

      toast.success('College updated successfully');
      return {
        success: true,
        college: this.transformCollege(response.data),
      };
    } catch (error) {
      console.error(`Failed to update college ${id}:`, error);

      const apiError = error as ApiError;

      // Handle specific error types
      if (apiError.status === 409) {
        const errorMessage = apiError.message || 'College name already exists';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'conflict',
        };
      }

      if (apiError.status === 401 || apiError.status === 403) {
        const errorMessage = 'You do not have permission to update colleges';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'unauthorized',
        };
      }

      if (apiError.status === 404) {
        const errorMessage = 'College not found';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'unknown',
        };
      }

      if (apiError.status === 400) {
        const errorMessage = apiError.message || 'Invalid college data';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'validation',
        };
      }

      if (apiError.status === 408 || apiError.message === 'Request timeout') {
        const errorMessage = 'Request timeout. Please try again.';
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorType: 'network',
        };
      }

      // Generic error
      const errorMessage = apiError.message || 'Failed to update college';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
        errorType: 'unknown',
      };
    }
  }

  async deleteCollege(id: number): Promise<boolean> {
    try {
      const response = await apiClient.delete<null>(`${this.endpoint}/${id}`);

      if (response.message) {
        toast.success(response.message);
      } else {
        toast.success('College deleted successfully');
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to delete college ${id}:`, error);

      const apiError = error as ApiError;

      if (apiError.status === 401 || apiError.status === 403) {
        toast.error('You do not have permission to delete colleges');
        return false;
      }

      if (apiError.status === 404) {
        toast.error('College not found');
        return false;
      }

      if (apiError.status === 409) {
        toast.error('Cannot delete college with existing associations');
        return false;
      }

      toast.error(apiError.message || 'Failed to delete college');
      return false;
    }
  }

  async addCourseToCollege(collegeId: number, courseId: number): Promise<boolean> {
    try {
      await apiClient.post(`${this.endpoint}/${collegeId}/courses/${courseId}`);
      toast.success('Course added to college successfully');
      return true;
    } catch (error) {
      console.error(`Failed to add course ${courseId} to college ${collegeId}:`, error);

      const apiError = error as ApiError;

      if (apiError.status === 401 || apiError.status === 403) {
        toast.error('You do not have permission to manage college courses');
        return false;
      }

      if (apiError.status === 404) {
        toast.error('College or course not found');
        return false;
      }

      if (apiError.status === 409) {
        toast.error('Course already added to this college');
        return false;
      }

      toast.error(apiError.message || 'Failed to add course to college');
      return false;
    }
  }

  async removeCourseFromCollege(collegeId: number, courseId: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.endpoint}/${collegeId}/courses/${courseId}`);
      toast.success('Course removed from college successfully');
      return true;
    } catch (error) {
      console.error(`Failed to remove course ${courseId} from college ${collegeId}:`, error);

      const apiError = error as ApiError;

      if (apiError.status === 401 || apiError.status === 403) {
        toast.error('You do not have permission to manage college courses');
        return false;
      }

      if (apiError.status === 404) {
        toast.error('College or course not found');
        return false;
      }

      toast.error(apiError.message || 'Failed to remove course from college');
      return false;
    }
  }
}

export const collegeService = new CollegeService();
