export interface Enrollment {
  id: number;
  studentName: string;
  studentInitials: string;
  trainingName: string;
  progress: number;
  status: 'active' | 'pending' | 'completed';
  paidAmount: number;
  paymentMethod: 'esewa' | 'khalti' | 'bank_transfer';
  paymentVerified: boolean;
  transactionId?: string;
  enrollmentDate: string;
}

export interface EnrollmentApiResponse {
  enrollmentId: number;
  userId: number;
  userName: string;
  trainingId: number;
  trainingName: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  enrollmentDate: string;
  completionDate: string | null;
  paidAmount: number;
  paymentReference: string;
  paymentMethod: 'ESEWA' | 'KHALTI' | 'BANK_TRANSFER';
  progressPercentage: number;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  paymentProofName: string | null;
}

export interface EnrollmentListResponse {
  message: string;
  data: {
    content: EnrollmentApiResponse[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    isLast: boolean;
  };
}

export interface EnrollmentQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface EnrollmentFilters {
  search: string;
  trainingProgram: string;
  status: string;
  paymentMethod: string;
  dateRange: string;
}

export type EnrollmentStatus = 'active' | 'pending' | 'completed';
export type PaymentMethod = 'esewa' | 'khalti' | 'bank_transfer';
