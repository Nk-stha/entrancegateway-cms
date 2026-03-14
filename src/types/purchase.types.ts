// Purchase types for quiz purchases management

export type PurchaseStatus = 
  | 'PAID'
  | 'UNPAID'
  | 'PENDING'
  | 'PAYMENT_RECEIVED_ADMIN_APPROVAL_PENDING'
  | 'ABORTED'
  | 'FAILED'
  | 'PAYMENT_VERIFIED'
  | 'CANCELLED_BY_ADMIN';

export interface QuizPurchase {
  purchaseId: number;
  transactionId: string;
  amount: number;
  purchaseDate: string;
  purchaseStatus: PurchaseStatus;
  setId: number | null;
  setName: string | null;
  trainingId: number | null;
  trainingName: string | null;
  userId: number;
  userName: string;
  paymentProof: string | null;
  paymentMethod: string | null;
}

export interface QuizPurchaseQueryParams {
  userId?: number;
  status?: PurchaseStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface QuizPurchaseListResponse {
  content: QuizPurchase[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}
