/**
 * Cookie utility functions for token management
 * 
 * SECURITY NOTE:
 * These cookies do NOT use HttpOnly flag because the application architecture
 * requires JavaScript access to tokens for Authorization headers in API calls.
 * 
 * Current Architecture:
 * - Tokens stored in localStorage (primary source for API calls)
 * - Tokens stored in cookies (for SSR/middleware access)
 * - JavaScript reads from localStorage and adds to Authorization headers
 * 
 * To use HttpOnly cookies (more secure):
 * - Remove localStorage storage
 * - Remove Authorization headers from API calls
 * - Rely on automatic cookie inclusion in requests
 * - Requires backend to accept cookies instead of Authorization headers
 */

interface CookieOptions {
  path?: string;
  maxAge?: number;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
}

/**
 * Set a cookie with security flags
 * Note: HttpOnly cannot be set from JavaScript
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const {
    path = '/',
    maxAge = 60 * 60 * 24 * 7, // 7 days default
    sameSite = 'Lax',
    secure = process.env.NODE_ENV === 'production',
  } = options;

  const parts = [
    `${name}=${value}`,
    `path=${path}`,
    `max-age=${maxAge}`,
    `SameSite=${sameSite}`,
  ];

  if (secure) {
    parts.push('Secure');
  }

  document.cookie = parts.join('; ');
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = '/'): void {
  document.cookie = `${name}=; path=${path}; max-age=0`;
}

/**
 * Set access token in both localStorage and cookie
 */
export function setAccessToken(token: string): void {
  localStorage.setItem('accessToken', token);
  setCookie('accessToken', token, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Set refresh token in both localStorage and cookie
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem('refreshToken', token);
  setCookie('refreshToken', token, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Clear all authentication tokens
 */
export function clearAuthTokens(): void {
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');

  // Clear cookies
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
}
