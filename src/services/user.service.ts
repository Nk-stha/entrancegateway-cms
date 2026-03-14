import { apiClient } from '@/lib/api/apiClient';
import type { 
  UserQueryParams, 
  UserApiResponse,
  UserDetailApiResponse,
  User
} from '@/types/user.types';
import type { ApiError } from '@/types/api.types';

class UserService {
  private readonly endpoint = '/user';

  // Transform API response to UI format
  private transformUser(apiUser: UserApiResponse): User {
    return {
      id: apiUser.userId,
      fullname: apiUser.fullname,
      email: apiUser.email,
      contact: apiUser.contact,
      address: apiUser.address,
      dob: apiUser.dob,
      interested: apiUser.interested,
      latestQualification: apiUser.latestQualification,
      isVerified: apiUser.isVerified,
      role: apiUser.role,
    };
  }

  // Build query string from params
  private buildQueryString(params: UserQueryParams): string {
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

  // Get list of users with pagination
  async getUsers(params: UserQueryParams = {}): Promise<{
    users: User[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isLast: boolean;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<{
        content: UserApiResponse[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
        last: boolean;
      }>(`${this.endpoint}${queryString}`);

      if (!response || !response.data) {
        console.error('Invalid response format from users API');
        throw new Error('Invalid response format');
      }

      const { content, totalElements, totalPages, pageNumber, pageSize, last } = response.data;

      return {
        users: content.map((user: UserApiResponse) => this.transformUser(user)),
        totalElements,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        isLast: last,
      };
    } catch (error) {
      const apiError = error as ApiError;
      
      console.error('Failed to fetch users:', apiError.message);

      // Return empty result for silent error handling
      return {
        users: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params.size || 10,
        isLast: true,
      };
    }
  }

  // Get single user by ID with full details
  async getUserById(id: number): Promise<UserDetailApiResponse | null> {
    try {
      const queryParams = new URLSearchParams({
        includeEnrollments: 'true',
        includeQuizAttempts: 'true',
        includePurchases: 'true',
        includeAdmissions: 'true',
      });

      const response = await apiClient.get<UserDetailApiResponse>(
        `${this.endpoint}/${id}/full?${queryParams.toString()}`
      );

      if (!response || !response.data) {
        console.error(`Invalid response format for user ${id}`);
        return null;
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      
      console.error(`Failed to fetch user ${id}:`, apiError.message);

      // Return null for component to handle
      return null;
    }
  }

  // Delete user
  async deleteUser(id: number): Promise<{
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
      
      console.error(`Failed to delete user ${id}:`, apiError.message);

      if (apiError.status === 404) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      if (apiError.status === 403) {
        return {
          success: false,
          error: 'You do not have permission to delete this user',
        };
      }

      if (apiError.status === 409) {
        return {
          success: false,
          error: 'Cannot delete user with active enrollments or purchases',
        };
      }

      return {
        success: false,
        error: apiError.message || 'Failed to delete user. Please try again.',
      };
    }
  }
}

export const userService = new UserService();
