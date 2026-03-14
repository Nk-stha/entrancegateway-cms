import { apiClient } from '@/lib/api/apiClient';
import type { 
  QuizPurchase,
  QuizPurchaseQueryParams,
  QuizPurchaseListResponse
} from '@/types/purchase.types';
import type { ApiError } from '@/types/api.types';

class PurchaseService {
  private readonly endpoint = '/purchases/admin/quizzes';
  
  async approvePurchase(purchaseId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await apiClient.patch(`${this.endpoint}/${purchaseId}/approve`);
      
      return {
        success: true,
      };
    } catch (error) {
      const apiError = error as ApiError;
      
      console.error(`Failed to approve purchase ${purchaseId}:`, apiError.message);

      let errorMessage = 'Failed to approve purchase';
      
      if (apiError.status === 404) {
        errorMessage = 'Purchase not found';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to approve purchases';
      } else if (apiError.status === 409) {
        errorMessage = 'Purchase cannot be approved in its current state';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async rejectPurchase(purchaseId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await apiClient.patch(`${this.endpoint}/${purchaseId}/reject`);
      
      return {
        success: true,
      };
    } catch (error) {
      const apiError = error as ApiError;
      
      console.error(`Failed to reject purchase ${purchaseId}:`, apiError.message);

      let errorMessage = 'Failed to reject purchase';
      
      if (apiError.status === 404) {
        errorMessage = 'Purchase not found';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to reject purchases';
      } else if (apiError.status === 409) {
        errorMessage = 'Purchase cannot be rejected in its current state';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private buildQueryString(params: QuizPurchaseQueryParams): string {
    const queryParams = new URLSearchParams();
    
    if (params.userId !== undefined) {
      queryParams.append('userId', params.userId.toString());
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
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

  async getQuizPurchases(params: QuizPurchaseQueryParams = {}): Promise<{
    purchases: QuizPurchase[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isLast: boolean;
    error?: string;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<QuizPurchaseListResponse>(
        `${this.endpoint}${queryString}`
      );

      if (!response || !response.data) {
        console.error('Invalid response format from quiz purchases API');
        return {
          purchases: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: params.size || 10,
          isLast: true,
          error: 'Invalid response format from server',
        };
      }

      const { content, totalElements, totalPages, pageNumber, pageSize, last } = response.data;

      return {
        purchases: content || [],
        totalElements: totalElements || 0,
        totalPages: totalPages || 0,
        currentPage: pageNumber || 0,
        pageSize: pageSize || params.size || 10,
        isLast: last !== undefined ? last : true,
      };
    } catch (error) {
      const apiError = error as ApiError;
      
      console.error('Failed to fetch quiz purchases:', apiError.message);

      let errorMessage = 'Failed to load quiz purchases';
      
      if (apiError.status === 403) {
        errorMessage = 'You do not have permission to view quiz purchases';
      } else if (apiError.status === 404) {
        errorMessage = 'Quiz purchases endpoint not found';
      } else if (apiError.status && apiError.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      return {
        purchases: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params.size || 10,
        isLast: true,
        error: errorMessage,
      };
    }
  }
}

export const purchaseService = new PurchaseService();
