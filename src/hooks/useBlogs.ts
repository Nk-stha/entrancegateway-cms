import { useState, useEffect, useRef } from 'react';
import { blogService } from '@/services/blog.service';
import type { Blog, BlogQueryParams } from '@/types/blog.types';

export function useBlogs(params: BlogQueryParams = {}) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);

      const result = await blogService.getBlogs(paramsRef.current);

      setBlogs(result.blogs);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      setLoading(false);
    };

    fetchBlogs();
  }, [params.page, params.size, params.sortBy, params.sortDir, params.status, params.search]);

  const refetch = async () => {
    setLoading(true);
    const result = await blogService.getBlogs(paramsRef.current);
    setBlogs(result.blogs);
    setTotalElements(result.totalElements);
    setTotalPages(result.totalPages);
    setCurrentPage(result.currentPage);
    setLoading(false);
  };

  return {
    blogs,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    refetch,
  };
}
