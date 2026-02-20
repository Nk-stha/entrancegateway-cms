import { apiClient } from '@/lib/api/apiClient';
import type {
  Enrollment,
  EnrollmentApiResponse,
  EnrollmentQueryParams,
} from '@/types/enrollment.types';
import type { ApiError } from '@/types/api.types';

class EnrollmentService {
  private readonly endpoint = '/training-enrollments';

  private transformEnrollment(apiEnrollment: EnrollmentApiResponse): Enrollment {
    const getInitials = (name: string): string => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };

    const mapStatus = (apiStatus: string): 'active' | 'pending' | 'completed' | 'payment_pending' | 'payment_received_admin_approval_pending' | 'cancelled' | 'payment_failed' | 'expired' | 'suspended' => {
      const statusMap: Record<string, 'active' | 'pending' | 'completed' | 'payment_pending' | 'payment_received_admin_approval_pending' | 'cancelled' | 'payment_failed' | 'expired' | 'suspended'> = {
        'ACTIVE': 'active',
        'PENDING': 'pending',
        'PAYMENT_PENDING': 'payment_pending',
        'PAYMENT_RECEIVED_ADMIN_APPROVAL_PENDING': 'payment_received_admin_approval_pending',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled',
        'PAYMENT_FAILED': 'payment_failed',
        'EXPIRED': 'expired',
        'SUSPENDED': 'suspended',
      };
      return statusMap[apiStatus] || 'pending';
    };

    const mapPaymentMethod = (apiMethod: string): 'esewa' | 'khalti' | 'bank_transfer' => {
      const methodMap: Record<string, 'esewa' | 'khalti' | 'bank_transfer'> = {
        'ESEWA': 'esewa',
        'KHALTI': 'khalti',
        'BANK_TRANSFER': 'bank_transfer',
      };
      return methodMap[apiMethod] || 'esewa';
    };

    const formatDate = (dateString: string): string => {
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
    };

    return {
      id: apiEnrollment.enrollmentId,
      studentName: apiEnrollment.userName,
      studentInitials: getInitials(apiEnrollment.userName),
      trainingName: apiEnrollment.trainingName,
      progress: apiEnrollment.progressPercentage,
      status: mapStatus(apiEnrollment.status),
      paidAmount: apiEnrollment.paidAmount,
      paymentMethod: mapPaymentMethod(apiEnrollment.paymentMethod),
      paymentVerified: !!apiEnrollment.paymentProofName,
      transactionId: apiEnrollment.paymentReference,
      enrollmentDate: formatDate(apiEnrollment.enrollmentDate),
    };
  }

  private buildQueryString(params: EnrollmentQueryParams): string {
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

  async getEnrollments(params: EnrollmentQueryParams = {}): Promise<{
    enrollments: Enrollment[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isLast: boolean;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<{
        content: EnrollmentApiResponse[];
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
        enrollments: content.map((enrollment: EnrollmentApiResponse) => this.transformEnrollment(enrollment)),
        totalElements,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        isLast,
      };
    } catch (error) {
      const apiError = error as ApiError;

      console.error('Failed to fetch enrollments:', apiError);

      return {
        enrollments: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params.size || 10,
        isLast: true,
      };
    }
  }

  async getEnrollmentById(id: number): Promise<EnrollmentApiResponse | null> {
    try {
      const response = await apiClient.get<EnrollmentApiResponse>(`${this.endpoint}/${id}`);

      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to fetch enrollment ${id}:`, apiError);
      return null;
    }
  }

  async approveEnrollment(enrollmentId: number): Promise<EnrollmentApiResponse | null> {
    try {
      const response = await apiClient.patch<EnrollmentApiResponse>(
        `${this.endpoint}/${enrollmentId}/approve`
      );

      if (!response || !response.data) {
        console.error(`Failed to approve enrollment ${enrollmentId}: Invalid response format`);
        return null;
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to approve enrollment ${enrollmentId}:`, apiError);
      return null;
    }
  }

  async rejectEnrollment(enrollmentId: number, reason: string): Promise<EnrollmentApiResponse | null> {
    try {
      if (!reason || reason.trim().length === 0) {
        console.error('Rejection reason is required');
        return null;
      }

      const response = await apiClient.patch<EnrollmentApiResponse>(
        `${this.endpoint}/${enrollmentId}/reject?reason=${encodeURIComponent(reason)}`
      );

      if (!response || !response.data) {
        console.error(`Failed to reject enrollment ${enrollmentId}: Invalid response format`);
        return null;
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to reject enrollment ${enrollmentId}:`, apiError);
      return null;
    }
  }

  async cancelEnrollment(enrollmentId: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.endpoint}/cancle-by-system/${enrollmentId}`);
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to cancel enrollment ${enrollmentId}:`, apiError);
      return false;
    }
  }
}

export const enrollmentService = new EnrollmentService();
