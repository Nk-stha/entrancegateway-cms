export interface Blog {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  status: 'published' | 'draft' | 'archived';
  createdDate: string;
}

export interface BlogApiResponse {
  blogId: number;
  title: string;
  content: string;
  excerpt: string;
  imageName: string | null;
  blogStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  contactEmail: string;
  contactPhone: string | null;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  createdDate: string;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  image: File | null;
  blogStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  contactEmail: string;
  contactPhone: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface BlogCreateRequest {
  title: string;
  content: string;
  excerpt: string;
  blogStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  contactEmail: string;
  contactPhone: string | null;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface BlogListResponse {
  message: string;
  data: {
    content: BlogApiResponse[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    isLast: boolean;
  };
}

export interface BlogQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  status?: string;
  search?: string;
}

export interface BlogFilters {
  search: string;
  status: string;
}

export type BlogStatus = 'published' | 'draft' | 'archived';
