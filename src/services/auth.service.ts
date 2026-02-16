import { apiClient } from '@/lib/api/apiClient';
import type { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse 
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data) {
        this.setAccessToken(response.data.accessToken);
        this.setRefreshToken(response.data.refreshToken);
        
        this.setUserData({
          userId: response.data.userId,
          expiresAt: Date.now() + (response.data.expiresIn * 1000),
        });
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        '/auth/refresh-token',
        { refreshToken }
      );
      
      if (response.data) {
        this.setAccessToken(response.data.accessToken);
        
        this.setUserData({
          userId: response.data.userId,
          expiresAt: Date.now() + (response.data.expiresIn * 1000),
        });
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.clearTokens();
    this.clearUserData();
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = this.getAccessToken();
    const userData = this.getUserData();
    
    // Must have both token and valid user data
    if (!token || !userData) {
      return false;
    }
    
    // Check if token is expired
    const isExpired = Date.now() >= userData.expiresAt;
    
    if (isExpired) {
      // Clean up expired tokens
      this.clearTokens();
      this.clearUserData();
      return false;
    }
    
    return true;
  }

  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('accessToken', token);
    
    document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('refreshToken', token);
    
    document.cookie = `refreshToken=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
  }

  private setUserData(data: { userId: number; expiresAt: number }): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userData', JSON.stringify(data));
  }

  private getUserData(): { userId: number; expiresAt: number } | null {
    if (typeof window === 'undefined') return null;
    
    const data = localStorage.getItem('userData');
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private clearUserData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userData');
  }

  getUserId(): number | null {
    const userData = this.getUserData();
    return userData?.userId || null;
  }
}

export const authService = new AuthService();
