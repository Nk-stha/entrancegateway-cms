'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
    userData: string | null;
    isAuthenticated: boolean;
    cookies: string;
  }>({
    accessToken: null,
    refreshToken: null,
    userData: null,
    isAuthenticated: false,
    cookies: '',
  });

  useEffect(() => {
    const checkAuth = () => {
      setAuthState({
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        userData: localStorage.getItem('userData'),
        isAuthenticated: authService.isAuthenticated(),
        cookies: document.cookie,
      });
    };

    checkAuth();
  }, []);

  const clearAll = () => {
    localStorage.clear();
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-lg mb-2">Authentication Status</h2>
              <p className={`text-lg ${authState.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </p>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-2">LocalStorage</h2>
              <div className="bg-gray-100 p-4 rounded space-y-2 font-mono text-sm">
                <div>
                  <strong>accessToken:</strong>
                  <p className="break-all">{authState.accessToken || 'null'}</p>
                </div>
                <div>
                  <strong>refreshToken:</strong>
                  <p className="break-all">{authState.refreshToken || 'null'}</p>
                </div>
                <div>
                  <strong>userData:</strong>
                  <p className="break-all">{authState.userData || 'null'}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-lg mb-2">Cookies</h2>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm break-all">
                {authState.cookies || 'No cookies'}
              </div>
            </div>

            <button
              onClick={clearAll}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Auth Data & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
