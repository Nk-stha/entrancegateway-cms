export interface Note {
  noteId: number;
  slug: string;
  subject: string;
  subjectCode: string;
  noteName: string;
  syllabusId: number;
  noteDescription: string;
  courseId: number;
  courseName: string;
  semester: number;
  year: number;
  affiliation: string;
}

export interface NoteListResponse {
  message: string;
  data: {
    content: Note[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    last: boolean;
  };
}

export interface NoteQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface NoteFilters {
  affiliation: string;
  courseName: string;
  semester: string;
}

export interface CreateNoteRequest {
  noteName: string;
  noteDescription: string;
  syllabusId: number;
}

export interface CreateNoteResponse {
  message: string;
  data: Note;
}

export interface UpdateNoteRequest {
  noteDescription: string;
  syllabusId: number;
}

export interface UpdateNoteResponse {
  message: string;
  data: Note;
}

export interface UpdateNoteFileResponse {
  message: string;
  data: Note;
}

export interface NoteFormData {
  noteName: string;
  noteDescription: string;
  syllabusId: string;
  file: File | null;
}
