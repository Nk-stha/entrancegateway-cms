export interface TrainingFormData {
  name: string;
  category: string;
  certificateProvided: boolean;
  description: string;
  startDate: string;
  endDate: string;
  type: 'online' | 'onsite' | 'hybrid';
  hours: number;
  maxParticipants: number;
  price: number;
  offerPercentage: number;
  syllabus: string;
  location: string;
  remarks: string;
  file?: File | null;
}

export interface TrainingFormErrors {
  name?: string;
  category?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  hours?: string;
  maxParticipants?: string;
  price?: string;
  offerPercentage?: string;
  syllabus?: string;
  location?: string;
  general?: string;
}

export interface Training {
  id: number;
  name: string;
  courseCode: string;
  category: string;
  schedule: {
    startDate: string;
    endDate: string;
  };
  status: 'registration_open' | 'upcoming' | 'closed';
  capacity: {
    enrolled: number;
    total: number;
  };
  price: number;
}

export interface TrainingApiResponse {
  trainingId: number;
  trainingName: string;
  description: string;
  syllabusDescription: string;
  startDate: string;
  endDate: string;
  trainingType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  trainingStatus: 'REGISTRATION_OPEN' | 'UPCOMING' | 'CLOSED';
  trainingHours: number;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  trainingCategory: string;
  price: number;
  certificateProvided: boolean;
  materialsLink?: string;
  remarks?: string;
  offerPercentage?: number;
}

export interface TrainingCreateRequest {
  trainingName: string;
  description: string;
  syllabusDescription: string;
  startDate: string;
  endDate: string;
  trainingType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  trainingStatus: 'REGISTRATION_OPEN' | 'UPCOMING' | 'CLOSED';
  trainingHours: number;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  trainingCategory: string;
  price: number;
  certificateProvided: boolean;
  remarks?: string;
  offerPercentage?: number;
}

export interface TrainingListResponse {
  message: string;
  data: {
    content: TrainingApiResponse[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    isLast: boolean;
  };
}

export interface TrainingQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface TrainingFilters {
  search: string;
  category: string;
  status: string;
}

export type TrainingCategory = 'data-science' | 'web-development' | 'ui-ux' | 'digital-marketing';
export type TrainingType = 'online' | 'onsite' | 'hybrid';
export type TrainingStatus = 'registration_open' | 'upcoming' | 'closed';
