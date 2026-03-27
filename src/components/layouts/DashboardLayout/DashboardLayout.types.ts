import { ReactNode } from 'react';

export interface NavItem {
  label: string;
  href?: string;
  icon: string;
  active?: boolean;
  children?: NavItem[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials: string;
}


export interface DashboardLayoutProps {
  children: ReactNode;
}
