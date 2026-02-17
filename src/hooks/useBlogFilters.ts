import { useState } from 'react';
import type { BlogFilters } from '@/types/blog.types';

export function useBlogFilters() {
  const [filters, setFilters] = useState<BlogFilters>({
    search: '',
    status: '',
  });

  const updateFilter = (key: keyof BlogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
