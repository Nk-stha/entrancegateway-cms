import { useState } from 'react';
import type { EnrollmentFilters } from '@/types/enrollment.types';

export function useEnrollmentFilters() {
  const [filters, setFilters] = useState<EnrollmentFilters>({
    search: '',
    trainingProgram: '',
    status: '',
    paymentMethod: '',
    dateRange: 'Oct 01, 2024 - Oct 31, 2024',
  });

  const updateFilter = <K extends keyof EnrollmentFilters>(
    key: K,
    value: EnrollmentFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      trainingProgram: '',
      status: '',
      paymentMethod: '',
      dateRange: 'Oct 01, 2024 - Oct 31, 2024',
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
