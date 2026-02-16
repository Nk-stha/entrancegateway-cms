export interface LoginFormData {
  email: string;
  password: string;
  rememberDevice: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

