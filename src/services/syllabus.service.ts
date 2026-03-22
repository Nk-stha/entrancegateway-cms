import { apiClient } from '@/lib/api/apiClient';
import type { 
  SyllabusListResponse, 
  SyllabusQueryParams,
  CreateSyllabusRequest,
  CreateSyllabusResponse,
  UpdateSyllabusRequest,
  UpdateSyllabusResponse,
  UpdateSyllabusFileResponse,
  Syllabus
} from '@/types/syllabus.types';
import type { ApiError } from '@/types/api.types';

class SyllabusService {
  private readonly endpoint = '/syllabus';

  private buildQueryString(params: SyllabusQueryParams): string {
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
    if (params.affiliation) {
      queryParams.append('affiliation', params.affiliation);
    }
    if (params.courseName) {
      queryParams.append('courseName', params.courseName);
    }
    if (params.semester !== undefined) {
      queryParams.append('semester', params.semester.toString());
    }

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getSyllabusList(params: SyllabusQueryParams = {}): Promise<{
    syllabusList: SyllabusListResponse['data'];
    error?: string;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<SyllabusListResponse['data']>(
        `${this.endpoint}${queryString}`
      );

      if (!response || !response.data) {
        return {
          syllabusList: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            pageNumber: 0,
            pageSize: params.size || 10,
            last: true,
          },
        };
      }

      return {
        syllabusList: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to fetch syllabus list:', apiError);

      return {
        syllabusList: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageNumber: 0,
          pageSize: params.size || 10,
          last: true,
        },
        error: apiError.message || 'Failed to fetch syllabus list',
      };
    }
  }

  async downloadSyllabus(syllabusId: number, fileName: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const blob = await apiClient.download(`${this.endpoint}/${syllabusId}/download`);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      link.addEventListener('click', () => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });

      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to download syllabus ${syllabusId}:`, apiError);

      return {
        success: false,
        error: apiError.message || 'Failed to download syllabus',
      };
    }
  }

  async createSyllabus(
    data: CreateSyllabusRequest,
    file: File
  ): Promise<{
    success: boolean;
    data?: { syllabusId: number; syllabusTitle: string };
    error?: string;
  }> {
    try {
      const formData = new FormData();
      
      const syllabusBlob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      formData.append('syllabus', syllabusBlob);
      formData.append('file', file);

      const response = await apiClient.postMultipart<CreateSyllabusResponse>(
        this.endpoint,
        formData
      );

      if (!response || !response.data || !response.data.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to create syllabus:', apiError);

      let errorMessage = 'Failed to create syllabus';

      if (apiError.status === 400) {
        errorMessage = 'Invalid syllabus data. Please check all fields.';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to create syllabus.';
      } else if (apiError.status === 409) {
        errorMessage = 'A syllabus with this title and course already exists.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getSyllabusById(syllabusId: number): Promise<{
    syllabus?: Syllabus;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<Syllabus>(`${this.endpoint}/${syllabusId}`);

      if (!response || !response.data) {
        return {
          error: 'Syllabus not found',
        };
      }

      return {
        syllabus: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to fetch syllabus ${syllabusId}:`, apiError);

      let errorMessage = 'Failed to fetch syllabus';

      if (apiError.status === 404) {
        errorMessage = 'Syllabus not found';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        error: errorMessage,
      };
    }
  }

  async updateSyllabus(
    syllabusId: number,
    data: UpdateSyllabusRequest
  ): Promise<{
    success: boolean;
    data?: { syllabusId: number; syllabusTitle: string };
    error?: string;
  }> {
    try {
      const response = await apiClient.put<UpdateSyllabusResponse>(
        `${this.endpoint}/${syllabusId}`,
        data
      );

      if (!response || !response.data || !response.data.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to update syllabus ${syllabusId}:`, apiError);

      let errorMessage = 'Failed to update syllabus';

      if (apiError.status === 400) {
        errorMessage = 'Invalid syllabus data. Please check all fields.';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to update syllabus.';
      } else if (apiError.status === 404) {
        errorMessage = 'Syllabus not found';
      } else if (apiError.status === 409) {
        errorMessage = 'A syllabus with this title and course already exists.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async updateSyllabusWithFile(
    syllabusId: number,
    data: UpdateSyllabusRequest,
    file: File
  ): Promise<{
    success: boolean;
    data?: { syllabusId: number; syllabusTitle: string };
    error?: string;
  }> {
    try {
      const formData = new FormData();
      
      const syllabusBlob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      formData.append('syllabus', syllabusBlob);
      formData.append('file', file);

      const response = await apiClient.putMultipart<UpdateSyllabusResponse>(
        `${this.endpoint}/${syllabusId}`,
        formData
      );

      if (!response || !response.data || !response.data.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to update syllabus ${syllabusId}:`, apiError);

      let errorMessage = 'Failed to update syllabus';

      if (apiError.status === 400) {
        errorMessage = 'Invalid syllabus data. Please check all fields.';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to update syllabus.';
      } else if (apiError.status === 404) {
        errorMessage = 'Syllabus not found';
      } else if (apiError.status === 409) {
        errorMessage = 'A syllabus with this title and course already exists.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async updateSyllabusFile(
    syllabusId: number,
    file: File
  ): Promise<{
    success: boolean;
    data?: Syllabus;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.putMultipart<UpdateSyllabusFileResponse>(
        `${this.endpoint}/${syllabusId}/file`,
        formData
      );

      if (!response || !response.data || !response.data.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to update syllabus file ${syllabusId}:`, apiError);

      let errorMessage = 'Failed to update syllabus file';

      if (apiError.status === 400) {
        errorMessage = 'Invalid file. Please upload a valid PDF.';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to update syllabus file.';
      } else if (apiError.status === 404) {
        errorMessage = 'Syllabus not found';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async deleteSyllabus(syllabusId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await apiClient.delete(`${this.endpoint}/${syllabusId}`);
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to delete syllabus ${syllabusId}:`, apiError);

      let errorMessage = 'Failed to delete syllabus';

      if (apiError.status === 403) {
        errorMessage = 'You do not have permission to delete syllabus.';
      } else if (apiError.status === 404) {
        errorMessage = 'Syllabus not found';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const syllabusService = new SyllabusService();
