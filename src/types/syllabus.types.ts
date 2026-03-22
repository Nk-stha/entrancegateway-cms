export interface Syllabus {
  syllabusId: number;
  courseId: number;
  syllabusTitle: string;
  subjectName: string;
  syllabusFile: string;
  courseCode: string;
  creditHours: number;
  lectureHours: number;
  practicalHours: number;
  courseName: string;
  semester: number;
  year: number | null;
}

export interface SyllabusListResponse {
  message: string;
  data: {
    content: Syllabus[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    last: boolean;
  };
}

export interface SyllabusQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  affiliation?: string;
  courseName?: string;
  semester?: number;
}

export interface SyllabusFilters {
  affiliation: string;
  courseName: string;
  semester: string;
}

export interface CreateSyllabusRequest {
  syllabusTitle: string;
  subjectName: string;
  courseCode: string;
  creditHours: number;
  lectureHours: number;
  practicalHours: number;
  courseId: number;
  semester: number;
  year: number | null;
}

export interface CreateSyllabusResponse {
  message: string;
  data: {
    syllabusId: number;
    syllabusTitle: string;
  };
}

export interface UpdateSyllabusRequest {
  syllabusTitle: string;
  subjectName: string;
  courseCode: string;
  creditHours: number;
  lectureHours: number;
  practicalHours: number;
  courseId: number;
  semester: number;
  year: number | null;
}

export interface UpdateSyllabusResponse {
  message: string;
  data: {
    syllabusId: number;
    syllabusTitle: string;
  };
}

export interface UpdateSyllabusFileResponse {
  message: string;
  data: Syllabus;
}

export interface SyllabusFormData {
  syllabusTitle: string;
  subjectName: string;
  courseCode: string;
  creditHours: string;
  lectureHours: string;
  practicalHours: string;
  courseId: string;
  semester: string;
  year: string;
  file: File | null;
}
