'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useOldQuestionForm } from '@/hooks/useOldQuestionForm';

function CreateOldQuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSyllabusId = searchParams.get('syllabusId') || undefined;
  const preselectedCourseId = searchParams.get('courseId') || undefined;

  const {
    formData,
    errors,
    loading,
    syllabusList,
    coursesList,
    loadingSyllabus,
    loadingCourses,
    handleInputChange,
    handleSubmit,
    resetForm,
  } = useOldQuestionForm(preselectedSyllabusId, preselectedCourseId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      router.push('/dashboard/old-questions');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('file', file);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl md:text-3xl font-extrabold tracking-tight font-roboto"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Upload Old Question
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Add a new past examination paper to the system
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="space-y-6">
              {errors.general && (
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    borderColor: 'var(--color-error)',
                    color: 'var(--color-error)'
                  }}
                >
                  {errors.general}
                </div>
              )}
              
              {/* Basic Information */}
              <div>
                <h2 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'var(--color-brand-navy)' }}
                >
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Set Name"
                    type="text"
                    placeholder="e.g., 2080 Set A"
                    value={formData.setName}
                    onChange={(e) => handleInputChange('setName', e.target.value)}
                    error={errors.setName}
                    required
                  />
                  <Input
                    label="Year"
                    type="number"
                    placeholder="e.g., 2080"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    error={errors.year}
                    required
                  />
                  <Select
                    label="Syllabus"
                    value={formData.syllabusId}
                    onChange={(e) => handleInputChange('syllabusId', e.target.value)}
                    error={errors.syllabusId}
                    options={[
                      { value: '', label: loadingSyllabus ? 'Loading syllabus...' : 'Select a syllabus' },
                      ...syllabusList.map(syllabus => ({
                        value: syllabus.syllabusId.toString(),
                        label: `${syllabus.syllabusTitle} - ${syllabus.courseName} (Sem ${syllabus.semester})`
                      }))
                    ]}
                    disabled={loadingSyllabus}
                    required
                  />
                  <Select
                    label="Course"
                    value={formData.courseId}
                    onChange={(e) => handleInputChange('courseId', e.target.value)}
                    error={errors.courseId}
                    options={[
                      { value: '', label: loadingCourses ? 'Loading courses...' : 'Select a course' },
                      ...coursesList.map(course => ({
                        value: course.courseId.toString(),
                        label: course.courseName
                      }))
                    ]}
                    disabled={loadingCourses}
                    required
                  />
                  <div className="md:col-span-2">
                    <label htmlFor="description-create" className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description-create"
                      placeholder="e.g., Final examination paper"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <h2 
                  className="text-lg font-semibold mb-4"
                  style={{ color: 'var(--color-brand-navy)' }}
                >
                  Question Paper Document
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload PDF File <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:cursor-pointer
                        file:bg-gray-100
                        file:text-brand-navy
                        hover:file:bg-gray-200
                        transition-colors"
                    />
                    {formData.file && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    {errors.file && (
                      <p className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
                        {errors.file}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Only PDF files are accepted. Maximum file size: 10MB
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-brand-blue)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </span>
                  ) : (
                    'Upload Old Question'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function CreateOldQuestionPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    }>
      <CreateOldQuestionContent />
    </Suspense>
  );
}
