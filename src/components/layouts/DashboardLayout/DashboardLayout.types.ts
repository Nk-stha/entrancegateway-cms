import { ReactNode } from 'react';

export interface DashboardLayoutProps {
  children: ReactNode;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials: string;
}
