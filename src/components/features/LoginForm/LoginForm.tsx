'use client';

import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { useLoginForm } from '@/hooks/useLoginForm';
import type { LoginFormProps } from './LoginForm.types';

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } = useLoginForm();

  return (
    <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-6">
      <Input
        label="Administrator Email"
        type="email"
        name="email"
        id="email"
        placeholder="admin@entrancegateway.edu.np"
        value={formData.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
        error={errors.email}
        required
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        }
      />

      <Input
        label="Security Password"
        type="password"
        name="password"
        id="password"
        placeholder="••••••••••••"
        value={formData.password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('password', e.target.value)}
        error={errors.password}
        required
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />

      <Checkbox
        id="remember-device"
        name="remember-device"
        label="Remember this device for 30 days"
        checked={formData.rememberDevice}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('rememberDevice', e.target.checked)}
      />

      {errors.general && (
        <div className="alert alert-error" role="alert">
          {errors.general}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed font-roboto"
        style={{
          backgroundColor: 'var(--color-brand-gold)',
          color: 'var(--color-brand-navy)',
          boxShadow: '0 10px 15px -3px rgba(255, 193, 7, 0.2)'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = '#FFD54F';
          }
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = 'var(--color-brand-gold)';
        }}
      >
        {isSubmitting ? 'Logging In...' : 'Log In to CMS'}
      </button>
    </form>
  );
}
