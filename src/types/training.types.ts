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
  currentParticipants: number;
  price: number;
  offerPercentage: number;
  syllabus: string;
  location: string;
  remarks: string;
  file?: File | null;
  links: TrainingLink[];
}

export interface TrainingLink {
  label: string;
  url: string;
  linkType: 'DISCORD' | 'ZOOM' | 'MATERIALS' | 'OTHER';
}

export interface TrainingFormErrors {
  name?: string;
  category?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  hours?: string;
  maxParticipants?: string;
  currentParticipants?: string;
  price?: string;
  offerPercentage?: string;
  syllabus?: string;
  location?: string;
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
  slug: string;
  trainingName: string;
  description: string;
  syllabusDescription: string;
  startDate: string;
  endDate: string | null;
  trainingType: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  trainingStatus: 'REGISTRATION_OPEN' | 'UPCOMING' | 'CLOSED';
  trainingHours: number;
  location: string | null;
  maxParticipants: number;
  currentParticipants: number;
  trainingCategory: string;
  price: number;
  certificateProvided: boolean;
  materialsLink?: string;
  remarks?: string | null;
  offerPercentage?: number;
  links?: TrainingLinkResponse[];
  trainingLinks?: TrainingLinkResponse[];
}

export interface TrainingLinkResponse {
  linkId: number;
  label: string;
  url: string;
  linkType: 'DISCORD' | 'ZOOM' | 'MATERIALS' | 'OTHER';
}

export interface TrainingLinkRequest {
  label?: string;
  url?: string;
  linkType?: 'DISCORD' | 'ZOOM' | 'MATERIALS' | 'OTHER';
}

export interface TrainingCreateRequest {
  trainingName: string;
  description: string;
  syllabusDescription: string;
  startDate: string;
  endDate: string;
  trainingType: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  trainingStatus: 'REGISTRATION_OPEN' | 'UPCOMING' | 'CLOSED';
  trainingHours: number;
  location: string | null;
  maxParticipants: number;
  currentParticipants: number;
  trainingCategory: string;
  price: number;
  certificateProvided: boolean;
  remarks?: string;
  offerPercentage?: number;
  links?: TrainingLinkRequest[];
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
