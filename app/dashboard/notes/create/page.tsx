'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useNoteForm } from '@/hooks/useNoteForm';

function CreateNoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSyllabusId = searchParams.get('syllabusId') || undefined;

  const {
    formData,
    errors,
    loading,
    syllabusList,
    loadingSyllabus,
    handleInputChange,
    handleSubmit,
    resetForm,
  } = useNoteForm(preselectedSyllabusId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      router.push('/dashboard/notes');
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
                Create New Note
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Add a new course note to the system
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
                    label="Note Name"
                    type="text"
                    placeholder="e.g., Java Basics"
                    value={formData.noteName}
                    onChange={(e) => handleInputChange('noteName', e.target.value)}
                    error={errors.noteName}
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="e.g., Introduction to Java Programming"
                      value={formData.noteDescription}
                      onChange={(e) => handleInputChange('noteDescription', e.target.value)}
                      rows={4}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-colors"
                    />
                    {errors.noteDescription && (
                      <p className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
                        {errors.noteDescription}
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
                  Note Document
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
                      Creating...
                    </span>
                  ) : (
                    'Create Note'
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

export default function CreateNotePage() {
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
      <CreateNoteContent />
    </Suspense>
  );
}
