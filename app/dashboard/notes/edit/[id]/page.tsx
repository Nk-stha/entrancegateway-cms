'use client';

import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useNoteEditForm } from '@/hooks/useNoteEditForm';

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = parseInt(params.id as string, 10);
  const isValidId = !isNaN(noteId) && noteId > 0;

  const {
    formData,
    errors,
    loading,
    loadingData,
    syllabusList,
    loadingSyllabus,
    handleInputChange,
    handleSubmit,
    handleFileOnlyUpdate,
  } = useNoteEditForm(isValidId ? noteId : 0);

  if (!isValidId) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Note ID</h1>
              <p className="text-gray-600 mb-4">The note ID provided is not valid.</p>
              <button
                onClick={() => router.push('/dashboard/notes')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: 'var(--color-brand-blue)' }}
              >
                Back to Notes List
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await handleSubmit();
      if (success) {
        router.push('/dashboard/notes');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const onFileOnlyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await handleFileOnlyUpdate();
      if (success) {
        router.push('/dashboard/notes');
      }
    } catch (error) {
      console.error('Error updating file:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('file', file);
  };

  if (loadingData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: 'var(--color-brand-blue)' }}
              ></div>
              <p className="text-gray-600">Loading note data...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

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
                Edit Note
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Update note information
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
                <div className="grid grid-cols-1 gap-4">
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
                  <div>
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
                  Update Note Document (Optional)
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New PDF File
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
                    Leave empty to keep the existing file. Only PDF files are accepted. Maximum file size: 10MB
                  </p>
                  {formData.file && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={onFileOnlyUpdate}
                        disabled={loading || loadingData}
                        className="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--color-brand-gold)' }}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Updating File...
                          </span>
                        ) : (
                          'Update File Only'
                        )}
                      </button>
                      <p className="mt-2 text-sm text-gray-500">
                        Click this button to update only the file without changing metadata
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading || loadingData}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-brand-blue)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </span>
                  ) : (
                    'Update Note'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading || loadingData}
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
