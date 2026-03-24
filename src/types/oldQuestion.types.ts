export interface OldQuestion {
  id: number;
  slug: string;
  setName: string;
  description: string;
  year: number;
  pdfFilePath: string;
  syllabusId: number;
  subject: string;
  courseName: string;
  affiliation: string;
}

export interface OldQuestionListResponse {
  message: string;
  data: {
    content: OldQuestion[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    last: boolean;
  };
}

export interface OldQuestionQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface OldQuestionFilters {
  affiliation: string;
  courseName: string;
  year: string;
}

export interface CreateOldQuestionRequest {
  setName: string;
  description: string;
  year: number;
  syllabusId: number;
  courseId: number;
}

export interface CreateOldQuestionResponse {
  message: string;
  data: OldQuestion;
}

export interface UpdateOldQuestionRequest {
  setName: string;
  description: string;
  year: number;
  syllabusId: number;
  courseId: number;
}

export interface UpdateOldQuestionResponse {
  message: string;
  data: OldQuestion;
}

export interface OldQuestionFormData {
  setName: string;
  description: string;
  year: string;
  syllabusId: string;
  courseId: string;
  file: File | null;
}
