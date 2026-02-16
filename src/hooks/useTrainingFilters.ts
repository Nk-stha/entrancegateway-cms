import { useState } from 'react';
import type { TrainingFilters } from '@/types/training.types';

export function useTrainingFilters() {
  const [filters, setFilters] = useState<TrainingFilters>({
    search: '',
    category: '',
    status: '',
  });

  const updateFilter = <K extends keyof TrainingFilters>(
    key: K,
    value: TrainingFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
