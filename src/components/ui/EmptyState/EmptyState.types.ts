export interface EmptyStateProps {
  type: 'loading' | 'error' | 'empty';
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
