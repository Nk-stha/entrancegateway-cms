import type { ApiResponse, ApiError } from '@/types/api.types';

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: ApiError | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api/proxy', timeout: number = 30000) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  private async refreshAccessToken(): Promise<void> {
    if (typeof window === 'undefined') {
      throw { message: 'Cannot refresh token on server', status: 401 } as ApiError;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw { message: 'No refresh token available', status: 401 } as ApiError;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw { message: 'Token refresh failed', status: response.status } as ApiError;
      }

      const data = await response.json();
      
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        const isProduction = process.env.NODE_ENV === 'production';
        const secureFlag = isProduction ? '; Secure' : '';
        document.cookie = `accessToken=${data.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`;
        
        if (data.data.userId && data.data.expiresIn) {
          localStorage.setItem('userData', JSON.stringify({
            userId: data.data.userId,
            expiresAt: Date.now() + (data.data.expiresIn * 1000),
          }));
        }
      } else {
        throw { message: 'Invalid refresh response', status: 401 } as ApiError;
      }
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = this.defaultTimeout,
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (options.headers) {
        const existingHeaders = new Headers(options.headers);
        existingHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      }

      const token = this.getAccessToken();
      const isAuthEndpoint = endpoint === '/auth/login' || endpoint === '/auth/refresh-token';
      
      if (token && !isAuthEndpoint) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !isAuthEndpoint && !isRetry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.request<T>(endpoint, options, timeout, true);
            });
          }

          isRefreshing = true;
          refreshPromise = this.refreshAccessToken()
            .then(() => {
              processQueue(null);
            })
            .catch((error) => {
              processQueue(error);
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              throw error;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });

          await refreshPromise;
          return this.request<T>(endpoint, options, timeout, true);
        }

        throw {
          message: data.message || 'Request failed',
          errors: data.errors,
          status: response.status,
        } as ApiError;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            message: 'Request timeout',
            status: 408,
          } as ApiError;
        }
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async postMultipart<T>(endpoint: string, formData: FormData, timeout: number = this.defaultTimeout, isRetry: boolean = false): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: Record<string, string> = {};

      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !isRetry) {
          if (isRefreshing) {
            await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            return this.postMultipart<T>(endpoint, formData, timeout, true);
          }

          isRefreshing = true;
          try {
            await this.refreshAccessToken();
            processQueue(null);
            return this.postMultipart<T>(endpoint, formData, timeout, true);
          } catch (error) {
            processQueue(error as ApiError);
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw error;
          } finally {
            isRefreshing = false;
          }
        }

        throw {
          message: data.message || 'Request failed',
          errors: data.errors || data.fieldErrors,
          status: response.status,
        } as ApiError;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            message: 'Request timeout',
            status: 408,
          } as ApiError;
        }
      }

      throw error;
    }
  }

  async putMultipart<T>(endpoint: string, formData: FormData, timeout: number = this.defaultTimeout, isRetry: boolean = false): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: Record<string, string> = {};

      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !isRetry) {
          if (isRefreshing) {
            await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            return this.putMultipart<T>(endpoint, formData, timeout, true);
          }

          isRefreshing = true;
          try {
            await this.refreshAccessToken();
            processQueue(null);
            return this.putMultipart<T>(endpoint, formData, timeout, true);
          } catch (error) {
            processQueue(error as ApiError);
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw error;
          } finally {
            isRefreshing = false;
          }
        }

        throw {
          message: data.message || 'Request failed',
          errors: data.errors || data.fieldErrors,
          status: response.status,
        } as ApiError;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            message: 'Request timeout',
            status: 408,
          } as ApiError;
        }
      }

      throw error;
    }
  }

  async download(endpoint: string, timeout: number = this.defaultTimeout, isRetry: boolean = false): Promise<Blob> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: Record<string, string> = {};

      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 && !isRetry) {
          if (isRefreshing) {
            await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            return this.download(endpoint, timeout, true);
          }

          isRefreshing = true;
          try {
            await this.refreshAccessToken();
            processQueue(null);
            return this.download(endpoint, timeout, true);
          } catch (error) {
            processQueue(error as ApiError);
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw error;
          } finally {
            isRefreshing = false;
          }
        }

        const data = await response.json();
        throw {
          message: data.message || 'Download failed',
          errors: data.errors,
          status: response.status,
        } as ApiError;
      }

      return await response.blob();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            message: 'Request timeout',
            status: 408,
          } as ApiError;
        }
      }

      throw error;
    }
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }
}

export const apiClient = new ApiClient();
