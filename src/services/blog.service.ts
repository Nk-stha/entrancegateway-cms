import { apiClient } from '@/lib/api/apiClient';
import type {
  Blog,
  BlogApiResponse,
  BlogQueryParams,
  BlogFormData,
} from '@/types/blog.types';
import type { ApiError } from '@/types/api.types';

class BlogService {
  private readonly endpoint = '/blogs';

  private transformBlog(apiBlog: BlogApiResponse): Blog {
    const mapStatus = (apiStatus: string): 'published' | 'draft' | 'archived' => {
      const statusMap: Record<string, 'published' | 'draft' | 'archived'> = {
        'PUBLISHED': 'published',
        'DRAFT': 'draft',
        'ARCHIVED': 'archived',
      };
      return statusMap[apiStatus] || 'draft';
    };

    return {
      id: apiBlog.blogId,
      title: apiBlog.title,
      excerpt: apiBlog.excerpt,
      imageUrl: apiBlog.imageName,
      status: mapStatus(apiBlog.blogStatus),
      createdDate: apiBlog.createdDate,
    };
  }

  private buildQueryString(params: BlogQueryParams): string {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortDir) {
      queryParams.append('sortDir', params.sortDir);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getBlogs(params: BlogQueryParams = {}): Promise<{
    blogs: Blog[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    isLast: boolean;
  }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get<{
        content: BlogApiResponse[];
        totalElements: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
        isLast: boolean;
      }>(`${this.endpoint}${queryString}`);

      if (!response || !response.data) {
        throw new Error('Invalid response format');
      }

      const { content, totalElements, totalPages, pageNumber, pageSize, isLast } = response.data;

      return {
        blogs: content.map((blog: BlogApiResponse) => this.transformBlog(blog)),
        totalElements,
        totalPages,
        currentPage: pageNumber,
        pageSize,
        isLast,
      };
    } catch (error) {
      const apiError = error as ApiError;

      console.error('Failed to fetch blogs:', apiError);

      return {
        blogs: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params.size || 10,
        isLast: true,
      };
    }
  }

  async deleteBlog(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        console.error(`Blog ${id} not found`);
        throw new Error('Blog not found');
      }

      if (apiError.status === 403) {
        console.error('Permission denied:', apiError);
        throw new Error('You do not have permission to perform this action.');
      }

      console.error(`Failed to delete blog ${id}:`, apiError);
      throw new Error('Failed to delete blog');
    }
  }

  async createBlog(data: BlogFormData): Promise<BlogApiResponse | null> {
    try {
      const formData = new FormData();

      const blogData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        imageName: null,
        blogStatus: data.blogStatus,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
      };

      const blogBlob = new Blob([JSON.stringify(blogData)], { type: 'application/json' });
      formData.append('blog', blogBlob, 'blog.json');

      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.postMultipart<BlogApiResponse>(this.endpoint, formData);

      if (!response || !response.data) {
        throw new Error('Invalid response format');
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 400) {
        console.error('Validation failed:', apiError);
        throw new Error('Validation failed. Please check your input.');
      }

      if (apiError.status === 403) {
        console.error('Permission denied:', apiError);
        throw new Error('You do not have permission to perform this action.');
      }

      console.error('Failed to create blog:', apiError);
      throw new Error('Failed to create blog');
    }
  }

  async updateBlog(id: number, data: BlogFormData): Promise<BlogApiResponse | null> {
    try {
      const formData = new FormData();

      const blogData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        imageName: null,
        blogStatus: data.blogStatus,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
      };

      const blogBlob = new Blob([JSON.stringify(blogData)], { type: 'application/json' });
      formData.append('blog', blogBlob, 'blog.json');

      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await apiClient.putMultipart<BlogApiResponse>(`${this.endpoint}/${id}`, formData);

      if (!response || !response.data) {
        throw new Error('Invalid response format');
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 404) {
        console.error(`Blog ${id} not found`);
        throw new Error('Blog not found');
      }

      if (apiError.status === 400) {
        console.error('Validation failed:', apiError);
        throw new Error('Validation failed. Please check your input.');
      }

      if (apiError.status === 403) {
        console.error('Permission denied:', apiError);
        throw new Error('You do not have permission to perform this action.');
      }

      console.error(`Failed to update blog ${id}:`, apiError);
      throw new Error('Failed to update blog');
    }
  }

  async getBlogById(id: number): Promise<BlogApiResponse | null> {
    try {
      const response = await apiClient.get<BlogApiResponse>(`${this.endpoint}/${id}`);

      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Failed to fetch blog ${id}:`, apiError);
      return null;
    }
  }
}

export const blogService = new BlogService();
