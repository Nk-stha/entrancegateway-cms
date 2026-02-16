export interface ApiResponse<T = unknown> {
  message: string;
  data: T | null;
  errors?: Record<string, string>;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
  status?: number;
}
