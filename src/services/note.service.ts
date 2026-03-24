import { apiClient } from '@/lib/api/apiClient';
import type { 
  NoteListResponse, 
  NoteQueryParams,
  CreateNoteRequest,
  UpdateNoteRequest,
  Note
} from '@/types/note.types';
import type { ApiError } from '@/types/api.types';

class NoteService {
  private readonly endpoint = '/notes';

  private buildQueryString(params: NoteQueryParams & { affiliation?: string; courseName?: string; semester?: number }): string {
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
    if (params.affiliation) {
      queryParams.append('affiliation', params.affiliation);
    }
    if (params.courseName) {
      queryParams.append('courseName', params.courseName);
    }
    if (params.semester !== undefined) {
      queryParams.append('semester', params.semester.toString());
    }

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getNotesList(params: NoteQueryParams & { affiliation?: string; courseName?: string; semester?: number } = {}): Promise<{
    notesList: NoteListResponse['data'];
    error?: string;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<NoteListResponse['data']>(
        `${this.endpoint}${queryString}`
      );

      if (!response || !response.data) {
        return {
          notesList: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            pageNumber: 0,
            pageSize: params.size || 10,
            last: true,
          },
        };
      }

      return {
        notesList: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to fetch notes list:', apiError);

      return {
        notesList: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageNumber: 0,
          pageSize: params.size || 10,
          last: true,
        },
        error: apiError.message || 'Failed to fetch notes list',
      };
    }
  }

  async getNoteById(noteId: number): Promise<{
    note?: Note;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<Note>(`${this.endpoint}/${noteId}`);

      if (!response || !response.data) {
        return {
          error: 'Note not found',
        };
      }

      return {
        note: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to fetch note ${noteId}:`, apiError);

      let errorMessage = 'Failed to fetch note';

      if (apiError.status === 404) {
        errorMessage = 'Note not found';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        error: errorMessage,
      };
    }
  }

  async createNote(
    data: CreateNoteRequest,
    file: File
  ): Promise<{
    success: boolean;
    data?: Note;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      
      const noteBlob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      formData.append('note', noteBlob);
      formData.append('file', file);

      const response = await apiClient.postMultipart<Note>(
        this.endpoint,
        formData
      );

      if (!response || !response.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to create note:', apiError);

      let errorMessage = 'Failed to create note';

      if (apiError.status === 400) {
        errorMessage = 'Invalid note data. Please check all fields and ensure a file is uploaded.';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to create notes.';
      } else if (apiError.status === 409) {
        errorMessage = 'A note with this name already exists.';
      } else if (apiError.status === 500) {
        errorMessage = 'Database error. The syllabus ID may not exist or there may be a duplicate entry.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async updateNote(
    noteId: number,
    data: UpdateNoteRequest
  ): Promise<{
    success: boolean;
    data?: Note;
    error?: string;
  }> {
    try {
      const response = await apiClient.put<Note>(
        `${this.endpoint}/${noteId}`,
        data
      );

      if (!response || !response.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to update note ${noteId}:`, apiError);

      let errorMessage = 'Failed to update note';

      if (apiError.status === 400) {
        errorMessage = 'Invalid note data. Please check all fields.';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to update notes.';
      } else if (apiError.status === 404) {
        errorMessage = 'Note not found';
      } else if (apiError.status === 409) {
        errorMessage = 'A note with this name already exists.';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async updateNoteFile(
    noteId: number,
    file: File
  ): Promise<{
    success: boolean;
    data?: Note;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.putMultipart<Note>(
        `${this.endpoint}/${noteId}/file`,
        formData
      );

      if (!response || !response.data) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to update note file ${noteId}:`, apiError);

      let errorMessage = 'Failed to update note file';

      if (apiError.status === 400) {
        errorMessage = 'Invalid file. Please upload a valid PDF.';
      } else if (apiError.status === 403) {
        errorMessage = 'You do not have permission to update note files.';
      } else if (apiError.status === 404) {
        errorMessage = 'Note not found';
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async downloadNote(noteId: number, fileName: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const blob = await apiClient.download(`${this.endpoint}/${noteId}/download`);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to download note ${noteId}:`, apiError);

      return {
        success: false,
        error: apiError.message || 'Failed to download note',
      };
    }
  }

  async deleteNote(noteId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await apiClient.delete(`${this.endpoint}/${noteId}`);

      return { success: true };
    } catch (error) {
      console.error(`Failed to delete note ${noteId}:`, error);

      let errorMessage = 'Failed to delete note';

      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.status === 403) {
          errorMessage = 'You do not have permission to delete notes.';
        } else if (apiError.status === 404) {
          errorMessage = 'Note not found';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const noteService = new NoteService();
