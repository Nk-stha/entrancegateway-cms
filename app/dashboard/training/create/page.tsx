'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { MarkdownTextarea } from '@/components/ui/MarkdownTextarea';
import { Toggle } from '@/components/ui/Toggle';
import { useTrainingForm } from '@/hooks/useTrainingForm';
import { trainingService } from '@/services/training.service';
import { toast } from '@/lib/utils/toast';
import type { TrainingFormData } from '@/types/training.types';

export default function CreateTrainingPage() {
  const router = useRouter();
  const { formData, errors, isSubmitting, handleChange, handleSubmit, resetForm } = useTrainingForm();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    handleChange('file', file);
  };

  const handleCreateTraining = async (data: TrainingFormData) => {
    const result = await trainingService.createTraining(data);

    if (result.success) {
      toast.success('Training created successfully!');
      setTimeout(() => {
        router.push('/dashboard/training');
      }, 1000);
    } else {
      if (result.fieldErrors) {
        // Handle field-specific errors
        toast.error(result.error || 'Validation failed. Please check the form.');
      } else {
        toast.error(result.error || 'Failed to create training. Please try again.');
      }
    }
  };

  const handleDiscard = () => {
    resetForm();
    setSelectedFile(null);
    router.push('/dashboard/training');
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-gray-500 font-medium">
          <a href="/dashboard" className="hover:text-brand-blue transition-colors">
            Dashboard
          </a>
          <span className="mx-2 text-gray-300">/</span>
          <a href="/dashboard/training" className="hover:text-brand-blue transition-colors">
            Trainings
          </a>
          <span className="mx-2 text-gray-300">/</span>
          <span style={{ color: 'var(--color-brand-navy)' }}>Create New</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div>
            <h1 
              className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Create New Training
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Configure a new educational program for the platform.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleDiscard}
              className="px-4 md:px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              Discard Changes
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('training-form') as HTMLFormElement;
                form?.requestSubmit();
              }}
              disabled={isSubmitting}
              className="px-4 md:px-6 py-2.5 font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 text-sm md:text-base"
              style={{
                backgroundColor: 'var(--color-brand-gold)',
                color: 'var(--color-brand-navy)'
              }}
            >
              CREATE TRAINING
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          id="training-form"
          onSubmit={(e) => handleSubmit(e, handleCreateTraining)}
          className="space-y-6 md:space-y-8 bg-white p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl shadow-sm border border-gray-200"
        >
          {/* Basic Information */}
          <section>
            <h2 
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Training Name"
                  type="text"
                  placeholder="e.g. Data Science Boot Camp"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  required
                />
              </div>
              <Select
                label="Training Category"
                options={[
                  { value: 'data-science', label: 'Data Science' },
                  { value: 'web-development', label: 'Web Development' },
                  { value: 'ui-ux', label: 'UI/UX Design' },
                  { value: 'digital-marketing', label: 'Digital Marketing' },
                ]}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
              <div className="flex items-end pb-1">
                <Toggle
                  label="Certificate Provided"
                  checked={formData.certificateProvided}
                  onChange={(checked) => handleChange('certificateProvided', checked)}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  placeholder="Briefly describe the training program..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  error={errors.description}
                  required
                />
              </div>
            </div>
          </section>

          {/* Logistics */}
          <section>
            <h2 
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Logistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                error={errors.startDate}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                error={errors.endDate}
              />
              <Select
                label="Training Type"
                options={[
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'online', label: 'Online' },
                  { value: 'onsite', label: 'On-site' },
                ]}
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as 'online' | 'onsite' | 'hybrid')}
              />
              <Input
                label="Training Hours"
                type="number"
                placeholder="200"
                value={formData.hours || ''}
                onChange={(e) => handleChange('hours', parseInt(e.target.value) || 0)}
                error={errors.hours}
                required
              />
            </div>
          </section>

          {/* Enrollment & Pricing */}
          <section>
            <h2 
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Enrollment & Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <Input
                label="Max Participants"
                type="number"
                value={formData.maxParticipants || ''}
                onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value) || 0)}
                error={errors.maxParticipants}
                required
              />
              <Input
                label="Price (NPR)"
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                error={errors.price}
                required
              />
              <div>
                <Input
                  label="Offer Percentage (%)"
                  type="number"
                  value={formData.offerPercentage || ''}
                  onChange={(e) => handleChange('offerPercentage', parseInt(e.target.value) || 0)}
                  error={errors.offerPercentage}
                />
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-success)' }}>
                  Discount will be applied automatically
                </p>
              </div>
            </div>
          </section>

          {/* Program Details */}
          <section>
            <h2 
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Program Details
            </h2>
            <div className="space-y-4 md:space-y-6">
              <MarkdownTextarea
                label="Syllabus Description"
                placeholder="Describe the curriculum using markdown formatting..."
                rows={12}
                value={formData.syllabus}
                onChange={(e) => handleChange('syllabus', e.target.value)}
                error={errors.syllabus}
                helperText="Use markdown to format your syllabus. Supports headers, bold, italic, lists, links, code blocks, and more."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input
                  label="Location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  error={errors.location}
                />
                <Input
                  label="Remarks"
                  type="text"
                  placeholder="Any special requirements?"
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Materials (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-brand-blue transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            {selectedFile ? selectedFile.name : 'Click to upload file'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, DOC, DOCX up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        handleChange('file', null);
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
          </section>

          {/* Form Actions */}
          <div className="pt-6 md:pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
            <button
              type="button"
              onClick={handleDiscard}
              className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 font-bold rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
              style={{
                backgroundColor: 'var(--color-brand-gold)',
                color: 'var(--color-brand-navy)'
              }}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isSubmitting ? 'CREATING...' : 'CREATE TRAINING'}
            </button>
          </div>
        </form>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
