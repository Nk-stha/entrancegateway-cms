'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/features/LoginForm';
import { toast } from '@/lib/utils/toast';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/store/AuthContext';
import type { LoginFormData } from '@/types/auth.types';
import type { ApiError } from '@/types/api.types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (data: LoginFormData) => {
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });
      
      if (response.data) {
        login();
        
        toast.success(response.message || 'Login successful!', {
          description: 'Redirecting to dashboard...'
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error) {
      const apiError = error as ApiError;
      
      if (apiError.errors) {
        const errorMessages = Object.values(apiError.errors).join(', ');
        toast.error('Validation failed', {
          description: errorMessages
        });
      } else {
        toast.error(apiError.message || 'Login failed', {
          description: 'Please check your credentials and try again.'
        });
      }
      
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex antialiased overflow-hidden font-sans bg-white">
      {/* Left Panel - Brand Section */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 text-white"
        style={{ backgroundColor: 'var(--color-brand-navy)' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect fill="none" width="100" height="100" />
            <path d="M0 0L100 100M100 0L0 100" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-brand-gold)' }}
            >
              <Image
                src="/eg-logo.jpg"
                alt="EntranceGateway Logo"
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span 
                className="font-bold text-3xl tracking-tight leading-none font-roboto"
              >
                EntranceGateway
              </span>
              <span 
                className="text-sm font-semibold tracking-[0.2em] uppercase mt-1"
                style={{ color: 'rgba(255, 193, 7, 0.8)' }}
              >
                Admin CMS
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 
            className="text-5xl font-bold leading-tight mb-6 font-roboto"
          >
            Secure Academic<br />Management Portal
          </h1>

          {/* Description */}
          <p className="text-xl text-blue-100 max-w-lg leading-relaxed mb-12">
            Centralized administration for Nepal&apos;s premier educational entrance examinations. 
            Access control and data integrity for academic excellence.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
            <div className="flex items-start gap-3">
              <svg 
                className="w-6 h-6 flex-shrink-0" 
                style={{ color: 'var(--color-brand-gold)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Encrypted Access</h4>
                <p className="text-xs text-blue-200">
                  End-to-end security protocols for all administrative actions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg 
                className="w-6 h-6 flex-shrink-0" 
                style={{ color: 'var(--color-brand-gold)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-1">Real-time Auditing</h4>
                <p className="text-xs text-blue-200">
                  Complete visibility into system logs and data changes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-10 left-16 text-white/40 text-xs">
          © 2024 EntranceGateway Education Pvt. Ltd. | v4.2.0-Secure
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Image
              src="/eg-logo.jpg"
              alt="EntranceGateway Logo"
              width={40}
              height={40}
              className="rounded-lg"
              priority
            />
            <span 
              className="font-bold text-2xl tracking-tight font-roboto"
              style={{ 
                color: 'var(--color-brand-navy)'
              }}
            >
              EntranceGateway
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-10">
            <h2 
              className="text-3xl font-bold mb-2 font-roboto"
              style={{ 
                color: 'var(--color-brand-navy)'
              }}
            >
              Administrator Login
            </h2>
            <p className="text-gray-500">
              Authorized personnel only. Please verify your credentials.
            </p>
          </div>

          {/* Login Form */}
          <LoginForm onSubmit={handleLogin} />

          {/* Security Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-xs font-medium uppercase tracking-widest">
                This is a secure administrative portal
              </p>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              <span className="text-[10px] text-gray-400">IP: 103.121.2.24</span>
              <span className="text-[10px] text-gray-400">Session: AES-256-GCM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
