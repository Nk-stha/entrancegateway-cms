export interface Enrollment {
  enrollmentId: number;
  userId: number;
  userName: string;
  trainingId: number;
  trainingName: string;
  status: string;
  enrollmentDate: string;
  completionDate: string | null;
  paidAmount: number;
  paymentReference: string;
  paymentMethod: string;
  progressPercentage: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  paymentProofName: string | null;
}

export interface QuizAttempt {
  attemptId: number;
  userId: number;
  userName: string;
  setId: number;
  setName: string;
  score: number;
  totalQuestions: number;
  attemptDate: string;
  timeTaken: number;
  status: string;
}

export interface Purchase {
  purchaseId: number;
  transactionId: string;
  amount: number;
  purchaseDate: string;
  purchaseStatus: string;
  setId: number | null;
  setName: string | null;
  trainingId: number | null;
  trainingName: string | null;
  userId: number;
  userName: string;
}

export interface Admission {
  admissionId: number;
  userId: number;
  userName: string;
  collegeId: number;
  collegeName: string;
  courseId: number;
  courseName: string;
  admissionDate: string;
  status: string;
  remarks: string;
}

export interface UserApiResponse {
  userId: number;
  fullname: string;
  email: string;
  contact: string;
  address: string;
  dob: string;
  interested: string;
  latestQualification: string;
  isVerified: boolean;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  enrollments: unknown | null;
  quizAttempts: unknown | null;
  purchases: unknown | null;
  admissions: unknown | null;
}

export interface UserDetailApiResponse extends UserApiResponse {
  totalEnrollments: number;
  totalQuizAttempts: number;
  totalPurchases: number;
  totalAdmissions: number;
  isPaginated: boolean;
  enrollments: Enrollment[];
  quizAttempts: QuizAttempt[];
  purchases: Purchase[];
  admissions: Admission[];
  enrollmentsPaginated: unknown | null;
  quizAttemptsPaginated: unknown | null;
  purchasesPaginated: unknown | null;
  admissionsPaginated: unknown | null;
}

export interface User {
  id: number;
  fullname: string;
  email: string;
  contact: string;
  address: string;
  dob: string;
  interested: string;
  latestQualification: string;
  isVerified: boolean;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface UserListResponse {
  message: string;
  data: {
    content: UserApiResponse[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    last: boolean;
  };
}

export interface UserQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface UserFilters {
  search: string;
  role: string;
  verified: string;
}
