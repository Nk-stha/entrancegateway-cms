import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/user.service';
import type { User, UserQueryParams } from '@/types/user.types';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isLast: boolean;
  };
  goToPage: (page: number) => void;
  refetch: () => void;
}

export function useUsers(initialParams: UserQueryParams = {}): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<UserQueryParams>({
    page: 0,
    size: 10,
    sortBy: 'fullname',
    sortDir: 'asc',
    ...initialParams,
  });
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    isLast: true,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userService.getUsers(params);

      setUsers(result.users);
      setPagination({
        totalElements: result.totalElements,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        isLast: result.isLast,
      });
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
      setError('Failed to load users. Please try again.');
      setUsers([]);
      setPagination({
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params.size || 10,
        isLast: true,
      });
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const goToPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    goToPage,
    refetch,
  };
}
