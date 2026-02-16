import { authService } from '@/services/auth.service';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function ensureValidToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const accessToken = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();

  if (!accessToken || !refreshToken) {
    return false;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  if (isRefreshing) {
    await refreshPromise;
    return authService.isAuthenticated();
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      await authService.refreshToken(refreshToken);
      return true;
    } catch (error) {
      authService.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return await refreshPromise;
}

export function setupTokenRefreshInterval(): void {
  if (typeof window === 'undefined') return;

  const checkInterval = 60000;

  const intervalId = setInterval(async () => {
    if (authService.isAuthenticated()) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const { expiresAt } = JSON.parse(userData);
          const timeUntilExpiry = expiresAt - Date.now();
          
          if (timeUntilExpiry < 300000) {
            const refreshToken = authService.getRefreshToken();
            if (refreshToken) {
              await authService.refreshToken(refreshToken);
            }
          }
        } catch (error) {
          console.error('Token refresh check failed:', error);
        }
      }
    }
  }, checkInterval);

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalId);
    });
  }
}
