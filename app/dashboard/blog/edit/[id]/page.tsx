'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { MarkdownTextarea } from '@/components/ui/MarkdownTextarea';
import { Select } from '@/components/ui/Select';
import { useBlogForm } from '@/hooks/useBlogForm';
import { blogService } from '@/services/blog.service';
import { toast } from '@/lib/utils/toast';
import type { BlogFormData } from '@/types/blog.types';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = parseInt(params.id as string);
  const { formData, errors, updateField, validateForm, setFormData } = useBlogForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      const blog = await blogService.getBlogById(blogId);

      if (!blog) {
        setNotFound(true);
        toast.error('Blog not found');
        setLoading(false);
        return;
      }

      setFormData({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        blogStatus: blog.blogStatus,
        contactEmail: blog.contactEmail,
        contactPhone: blog.contactPhone || '',
        metaTitle: blog.metaTitle,
        metaDescription: blog.metaDescription,
        keywords: blog.keywords,
        image: null,
      });

      if (blog.imageName) {
        setImagePreview(blog.imageName);
      }

      setLoading(false);
    };

    loadBlog();
  }, [blogId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    updateField('image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await blogService.updateBlog(blogId, formData);
      if (result) {
        toast.success('Blog updated successfully!');
        setTimeout(() => {
          router.push('/dashboard/blog');
        }, 1000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/blog');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
              <p className="text-gray-500">Loading blog...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 mb-4">Blog not found</p>
              <button
                onClick={() => router.push('/dashboard/blog')}
                className="px-4 py-2 font-semibold rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--color-brand-blue)',
                  color: 'white',
                }}
              >
                Back to Blogs
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mb-6">
          <Link
            href="/dashboard/blog"
            className="flex items-center font-semibold hover:underline transition-all text-sm md:text-base"
            style={{ color: 'var(--color-brand-navy)' }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </Link>
        </div>

        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div>
            <h1 
              className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Edit Blog Post
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Update your blog post content and settings.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleUpdateBlog}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 
                className="text-base md:text-lg font-bold mb-4 md:mb-6"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Article Content
              </h2>
              <div className="space-y-4">
                <Input
                  label="Blog Title"
                  type="text"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  error={errors.title}
                  required
                />
                <Textarea
                  label="Excerpt"
                  placeholder="Brief summary of the blog post"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  error={errors.excerpt}
                  required
                />
                <MarkdownTextarea
                  label="Content"
                  placeholder="Write your blog content using markdown..."
                  rows={16}
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  error={errors.content}
                  helperText="Use markdown to format your content. Supports headers, bold, italic, lists, links, code blocks, and more."
                />
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 
                className="text-base md:text-lg font-bold mb-4 md:mb-6"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Featured Image
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Image (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload a new image to replace the existing one
                </p>
                {imagePreview && (
                  <div className="mb-4 relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    {selectedImage && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                          New Image
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-brand-blue transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            {selectedImage ? selectedImage.name : 'Click to upload new image'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        updateField('image', null);
                        setImagePreview(null);
                      }}
                      className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{
                        color: 'var(--color-error)',
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-6">
              <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 
                className="text-base md:text-lg font-bold mb-4 md:mb-6"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Post Settings
              </h2>
              <div className="space-y-4">
                <Select
                  label="Status"
                  options={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'ARCHIVED', label: 'Archived' },
                  ]}
                  value={formData.blogStatus}
                  onChange={(e) => updateField('blogStatus', e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
                />
                <Input
                  label="Contact Email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  error={errors.contactEmail}
                  required
                />
                <Input
                  label="Contact Phone"
                  type="tel"
                  placeholder="+977-9876543210"
                  value={formData.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  error={errors.contactPhone}
                />
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 
                className="text-base md:text-lg font-bold mb-4 md:mb-6"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                SEO Details
              </h2>
              <div className="space-y-4">
                <Input
                  label="Meta Title"
                  type="text"
                  placeholder="SEO title (max 60 characters)"
                  value={formData.metaTitle}
                  onChange={(e) => updateField('metaTitle', e.target.value)}
                  error={errors.metaTitle}
                  required
                />
                <Textarea
                  label="Meta Description"
                  placeholder="SEO description (max 160 characters)"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={(e) => updateField('metaDescription', e.target.value)}
                  error={errors.metaDescription}
                  required
                />
                <Input
                  label="Keywords"
                  type="text"
                  placeholder="keyword1, keyword2, keyword3"
                  value={formData.keywords}
                  onChange={(e) => updateField('keywords', e.target.value)}
                  error={errors.keywords}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 text-sm md:text-base"
                style={{
                  backgroundColor: 'var(--color-brand-gold)',
                  color: 'var(--color-brand-navy)',
                }}
              >
                {submitting ? 'UPDATING...' : 'UPDATE BLOG'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
            </div>
          </div>
        </form>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
