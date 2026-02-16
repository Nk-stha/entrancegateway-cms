import type { LoginFormData } from '@/types/auth.types';

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}
