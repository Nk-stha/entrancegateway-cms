import { apiClient } from '@/lib/api/apiClient';
import type { 
  OldQuestionListResponse, 
  OldQuestionQueryParams,
  CreateOldQuestionRequest,
  UpdateOldQuestionRequest,
  OldQuestion,
} from '@/types/oldQuestion.types';
import type { ApiError } from '@/types/api.types';

class OldQuestionService {
  private readonly endpoint = '/old-question-collections';

  private buildQueryString(params: OldQuestionQueryParams & { affiliation?: string; courseName?: string; year?: number }): string {
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
    if (params.year !== undefined) {
      queryParams.append('year', params.year.toString());
    }

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getOldQuestionsList(params: OldQuestionQueryParams & { affiliation?: string; courseName?: string; year?: number } = {}): Promise<{
    oldQuestionsList: OldQuestionListResponse['data'];
    error?: string;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<OldQuestionListResponse['data']>(
        `${this.endpoint}${queryString}`
      );

      if (!response || !response.data) {
        return {
          oldQuestionsList: {
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
        oldQuestionsList: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to fetch old questions list:', apiError);

      return {
        oldQuestionsList: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageNumber: 0,
          pageSize: params.size || 10,
          last: true,
        },
        error: apiError.message || 'Failed to fetch old questions list',
      };
    }
  }

  async createOldQuestion(
    data: CreateOldQuestionRequest,
    file: File
  ): Promise<{
    success: boolean;
    data?: OldQuestion;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      
      const dataBlob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      formData.append('data', dataBlob);
      formData.append('file', file);

      const response = await apiClient.postMultipart<OldQuestion>(
        this.endpoint,
        formData
      );

      if (!response || !response.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Failed to create old question:', error);

      let errorMessage = 'Failed to create old question';

      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.status === 400) {
          errorMessage = 'Invalid data. Please check all fields and ensure a file is uploaded.';
        } else if (apiError.status === 403) {
          errorMessage = 'You do not have permission to create old questions.';
        } else if (apiError.status === 409) {
          errorMessage = 'An old question with this name already exists.';
        } else if (apiError.status === 500) {
          errorMessage = 'Database error. The syllabus or course ID may not exist.';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getOldQuestionById(id: number): Promise<{
    oldQuestion?: OldQuestion;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<OldQuestion>(`${this.endpoint}/${id}`);

      if (!response || !response.data) {
        return {
          error: 'Old question not found',
        };
      }

      return {
        oldQuestion: response.data,
      };
    } catch (error) {
      console.error(`Failed to fetch old question ${id}:`, error);

      let errorMessage = 'Failed to fetch old question';

      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.status === 404) {
          errorMessage = 'Old question not found';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      return {
        error: errorMessage,
      };
    }
  }

  async updateOldQuestion(
    id: number,
    data: UpdateOldQuestionRequest,
    file?: File
  ): Promise<{
    success: boolean;
    data?: OldQuestion;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      
      const dataBlob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      formData.append('data', dataBlob);
      
      if (file) {
        formData.append('file', file);
      }

      const response = await apiClient.putMultipart<OldQuestion>(
        `${this.endpoint}/${id}`,
        formData
      );

      if (!response || !response.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Failed to update old question ${id}:`, error);

      let errorMessage = 'Failed to update old question';

      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.status === 400) {
          errorMessage = 'Invalid data. Please check all fields.';
        } else if (apiError.status === 403) {
          errorMessage = 'You do not have permission to update old questions.';
        } else if (apiError.status === 404) {
          errorMessage = 'Old question not found';
        } else if (apiError.status === 409) {
          errorMessage = 'An old question with this name already exists.';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async downloadOldQuestionFile(id: number, fileName: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const blob = await apiClient.download(`${this.endpoint}/${id}/file`);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error(`Failed to download old question file ${id}:`, error);

      let errorMessage = 'Failed to download old question file';

      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.status === 404) {
          errorMessage = 'Old question file not found';
        } else if (apiError.status === 403) {
          errorMessage = 'You do not have permission to download this file';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async deleteOldQuestion(id: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete old question ${id}:`, error);

      let errorMessage = 'Failed to delete old question';

      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.status === 404) {
          errorMessage = 'Old question not found';
        } else if (apiError.status === 403) {
          errorMessage = 'You do not have permission to delete old questions';
        } else if (apiError.status === 409) {
          errorMessage = 'Cannot delete old question due to existing dependencies';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const oldQuestionService = new OldQuestionService();
