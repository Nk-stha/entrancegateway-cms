'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useBlogForm } from '@/hooks/useBlogForm';
import { blogService } from '@/services/blog.service';
import { toast } from '@/lib/utils/toast';
import { MarkdownTextarea } from '@/components/ui/MarkdownTextarea';

export default function CreateBlogPage() {
  const router = useRouter();
  const { formData, errors, updateField, validateForm } = useBlogForm();
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (status: 'PUBLISHED' | 'DRAFT') => {
    updateField('blogStatus', status);
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const dataToSubmit = { ...formData, blogStatus: status };
      await blogService.createBlog(dataToSubmit);
      toast.success(`Blog ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully`);
      router.push('/dashboard/blog');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create blog');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            <div className="flex items-center gap-4 md:gap-8">
              <Link
                href="/dashboard/blog"
                className="flex items-center text-gray-500 hover:text-brand-navy transition-colors font-medium text-sm group"
              >
                <svg className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Blogs
              </Link>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <h1 className="text-base md:text-lg font-bold font-roboto uppercase tracking-tight" style={{ color: 'var(--color-brand-navy)' }}>
                Create New Post
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSubmit('PUBLISHED')}
                disabled={submitting}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all transform active:scale-[0.98] flex items-center gap-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-brand-gold)',
                  color: 'var(--color-brand-navy)',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = '#e6ae00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-brand-gold)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {submitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base font-bold font-roboto flex items-center gap-2" style={{ color: 'var(--color-brand-navy)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Article Content
                </h2>
              </div>
              <div className="p-4 md:p-6 space-y-6">
                <div>
                  <label htmlFor="blog-title" className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Blog Title
                  </label>
                  <input
                    id="blog-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full text-base md:text-lg font-medium py-2 md:py-3 px-4 rounded-lg border border-gray-300 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                    placeholder="e.g., Getting Started with Spring Boot"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Short Excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => updateField('excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm resize-none"
                    placeholder="A brief introduction to catch the reader's attention..."
                  />
                  {errors.excerpt && (
                    <p className="mt-1 text-xs text-red-600">{errors.excerpt}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">Summarize your post in 150-200 characters.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Content Editor
                  </label>
                  <MarkdownTextarea
                    value={formData.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    placeholder="Start writing your high-quality educational content here..."
                    rows={15}
                  />
                  {errors.content && (
                    <p className="mt-1 text-xs text-red-600">{errors.content}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Featured Image */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base font-bold font-roboto flex items-center gap-2" style={{ color: 'var(--color-brand-navy)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Featured Image
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="aspect-video w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-brand-blue transition-all">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-xs font-bold text-gray-500 uppercase">Upload Thumbnail</span>
                        <span className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB (1200x630px)</span>
                      </>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Post Settings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base font-bold font-roboto flex items-center gap-2" style={{ color: 'var(--color-brand-navy)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Post Settings
                </h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Blog Status
                  </label>
                  <select
                    id="status"
                    value={formData.blogStatus}
                    onChange={(e) => updateField('blogStatus', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Contact Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm"
                    placeholder="author@example.com"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-xs text-red-600">{errors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Contact Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm"
                    placeholder="+977-9812345678"
                  />
                </div>
              </div>
            </div>

            {/* SEO Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base font-bold font-roboto flex items-center gap-2" style={{ color: 'var(--color-brand-navy)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  SEO Details
                </h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label htmlFor="meta-title" className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Meta Title
                  </label>
                  <input
                    id="meta-title"
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => updateField('metaTitle', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm"
                    placeholder="Search engine title"
                  />
                </div>

                <div>
                  <label htmlFor="meta-desc" className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Meta Description
                  </label>
                  <textarea
                    id="meta-desc"
                    value={formData.metaDescription}
                    onChange={(e) => updateField('metaDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm resize-none"
                    placeholder="Brief description for search results..."
                  />
                </div>

                <div>
                  <label htmlFor="keywords" className="block text-sm font-bold mb-1.5 font-roboto" style={{ color: 'var(--color-brand-navy)' }}>
                    Keywords
                  </label>
                  <input
                    id="keywords"
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => updateField('keywords', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm"
                    placeholder="spring boot, java, tutorial, backend"
                  />
                  <p className="mt-1 text-[10px] text-gray-400">Separate keywords with commas.</p>
                </div>
              </div>
            </div>

            {/* Editor Tips */}
            <div className="rounded-xl p-5 text-white" style={{ backgroundColor: 'var(--color-brand-navy)' }}>
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5" style={{ color: 'var(--color-brand-gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold font-roboto text-sm uppercase tracking-wider">Editor Tips</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#BBDEFB' }}>
                Ensure all technical terms are linked to their respective documentation for better SEO ranking and user experience.
              </p>
            </div>
          </aside>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
