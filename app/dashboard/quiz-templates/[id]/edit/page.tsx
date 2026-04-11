'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Toggle } from '@/components/ui/Toggle';
import { EmptyState } from '@/components/ui/EmptyState';
import { useQuizTemplateForm } from '@/hooks/useQuizTemplateForm';
import { quizTemplateService } from '@/services/quizTemplate.service';
import { toast } from '@/lib/utils/toast';
import type { CreateQuizTemplateRequest } from '@/types/quiz.types';

export default function EditQuizTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    formData,
    errors,
    isSubmitting,
    difficultyTotal,
    handleChange,
    handleDifficultyChange,
    handleConstraintChange,
    handleTopicChange,
    addTopicRow,
    removeTopicRow,
    regenerateTopicId,
    handleSubmit,
    populateFromResponse,
  } = useQuizTemplateForm();

  // Cleanup redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // Fetch existing template data on mount
  useEffect(() => {
    const fetchTemplate = async () => {
      setLoadingTemplate(true);
      setLoadError(null);

      try {
        const result = await quizTemplateService.getQuizTemplateById(templateId);

        if (result.success && result.data) {
          populateFromResponse(result.data);
        } else {
          const message = result.error || 'Failed to load quiz template';
          setLoadError(message);
          toast.error(message);
        }
      } catch {
        const message = 'An unexpected error occurred while loading the quiz template.';
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoadingTemplate(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId, populateFromResponse]);

  const handleUpdateTemplate = async (payload: CreateQuizTemplateRequest) => {
    try {
      const result = await quizTemplateService.updateQuizTemplate(templateId, payload);

      if (result.success) {
        toast.success('Quiz template updated successfully!', {
          description: `Template "${result.data?.name}" has been updated.`,
        });
        redirectTimerRef.current = setTimeout(() => {
          router.push('/dashboard/quiz-templates');
        }, 1000);
      } else if (result.fieldErrors) {
        toast.error('Validation failed', {
          description: 'Please check the form for errors.',
        });
      } else {
        toast.error(result.error || 'Failed to update quiz template');
      }

      return result;
    } catch {
      const message = 'An unexpected error occurred while updating the quiz template.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const handleDiscard = () => {
    router.push('/dashboard/quiz-templates');
  };

  // Loading State
  if (loadingTemplate) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading quiz template..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Error State
  if (loadError) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(211, 47, 47, 0.08)' }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: 'var(--color-error)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3
              className="text-lg font-bold mb-2 font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Failed to Load Template
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
              {loadError}
            </p>
            <Link
              href="/dashboard/quiz-templates"
              className="px-5 py-2.5 font-semibold rounded-lg transition-colors text-white text-sm"
              style={{ backgroundColor: 'var(--color-brand-blue)' }}
            >
              Back to Templates
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-gray-500 font-medium">
          <Link href="/dashboard" className="hover:text-brand-blue transition-colors">
            Dashboard
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <Link href="/dashboard/quiz-templates" className="hover:text-brand-blue transition-colors">
            Quiz Templates
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <span style={{ color: 'var(--color-brand-navy)' }}>Edit Template</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          <div>
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Edit Quiz Template
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Update the quiz template configuration and settings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleDiscard}
              className="px-4 md:px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const form = document.getElementById('quiz-template-edit-form') as HTMLFormElement;
                form?.requestSubmit();
              }}
              disabled={isSubmitting}
              className="px-4 md:px-6 py-2.5 font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 text-sm md:text-base"
              style={{
                backgroundColor: 'var(--color-brand-gold)',
                color: 'var(--color-brand-navy)',
              }}
            >
              {isSubmitting ? 'UPDATING...' : 'UPDATE TEMPLATE'}
            </button>
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <div
            className="mb-6 px-4 py-3 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
              color: 'var(--color-error)',
              border: '1px solid rgba(211, 47, 47, 0.2)',
            }}
            role="alert"
          >
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form
          id="quiz-template-edit-form"
          onSubmit={(e) => handleSubmit(e, handleUpdateTemplate)}
          className="space-y-6 md:space-y-8 bg-white p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl shadow-sm border border-gray-200"
        >
          {/* ─── Section 1: Basic Information ─── */}
          <section>
            <h2
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                style={{ color: 'var(--color-brand-blue)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Template Name"
                  type="text"
                  placeholder="e.g., Medical Entrance Practice Set 1"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  placeholder="Describe the quiz template purpose..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  error={errors.description}
                />
              </div>
              <Select
                label="Template Type"
                value={formData.type}
                onChange={(e) =>
                  handleChange('type', e.target.value as 'PRACTICE' | 'COMPETITIVE')
                }
                options={[
                  { value: 'PRACTICE', label: 'Practice' },
                  { value: 'COMPETITIVE', label: 'Competitive' },
                ]}
                error={errors.type}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  handleChange('status', e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
                }
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PUBLISHED', label: 'Published' },
                  { value: 'ARCHIVED', label: 'Archived' },
                ]}
                error={errors.status}
              />
              <Input
                label="Entry Fee (Rs.)"
                type="number"
                step="0.01"
                min="0"
                max="99999.99"
                placeholder="0.00"
                value={formData.entryFee}
                onChange={(e) => handleChange('entryFee', e.target.value)}
                error={errors.entryFee}
                helperText="Set to 0 for free templates"
              />
            </div>
          </section>

          {/* ─── Section 2: Quiz Configuration ─── */}
          <section>
            <h2
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                style={{ color: 'var(--color-brand-blue)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Quiz Configuration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <Input
                label="Total Questions"
                type="number"
                min="1"
                placeholder="e.g., 50"
                value={formData.totalQuestions}
                onChange={(e) => handleChange('totalQuestions', e.target.value)}
                error={errors.totalQuestions}
                required
              />
              <Input
                label="Total Marks"
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={formData.totalMarks}
                onChange={(e) => handleChange('totalMarks', e.target.value)}
                error={errors.totalMarks}
                required
              />
              <Input
                label="Duration (Minutes)"
                type="number"
                min="1"
                placeholder="e.g., 60"
                value={formData.durationMinutes}
                onChange={(e) => handleChange('durationMinutes', e.target.value)}
                error={errors.durationMinutes}
                required
              />
            </div>

            {/* Negative Marking */}
            <div className="mt-6 p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <Toggle
                  label="Enable Negative Marking"
                  checked={formData.enableNegativeMarking}
                  onChange={(checked) => handleChange('enableNegativeMarking', checked)}
                />
              </div>
              {formData.enableNegativeMarking && (
                <div className="max-w-xs">
                  <Input
                    label="Marks Deducted Per Wrong Answer"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 0.25"
                    value={formData.negativeMarkValue}
                    onChange={(e) => handleChange('negativeMarkValue', e.target.value)}
                    error={errors.negativeMarkValue}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ─── Section 3: Topic Distribution ─── */}
          <section>
            <h2
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                style={{ color: 'var(--color-brand-blue)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Topic Distribution
            </h2>

            {errors.topicDistribution && (
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-error)' }}
                role="alert"
              >
                {errors.topicDistribution}
              </p>
            )}

            <div className="space-y-4">
              {formData.topicDistribution.map((topic, index) => (
                <div
                  key={topic.id}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--color-brand-navy)' }}
                    >
                      Topic {index + 1}
                    </span>
                    {formData.topicDistribution.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTopicRow(topic.id)}
                        className="text-xs font-medium px-2 py-1 rounded transition-colors"
                        style={{
                          color: 'var(--color-error)',
                          backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* Topic UUID */}
                    <div className="md:col-span-6">
                      <label
                        className="block text-xs font-bold uppercase tracking-wide mb-1"
                        style={{ color: 'var(--color-brand-navy)' }}
                      >
                        Topic ID (UUID)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={topic.topicId}
                          onChange={(e) =>
                            handleTopicChange(topic.id, 'topicId', e.target.value)
                          }
                          className="flex-1 px-3 py-2.5 bg-white border-2 rounded-lg text-gray-900 text-sm outline-none transition-colors"
                          style={{ borderColor: 'var(--color-gray-200)' }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--color-brand-blue)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--color-gray-200)';
                          }}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={() => regenerateTopicId(topic.id)}
                          className="px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-white"
                          style={{ backgroundColor: 'var(--color-brand-blue)' }}
                          title="Regenerate Topic UUID"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Question Count */}
                    <div className="md:col-span-3">
                      <Input
                        label="Question Count"
                        type="number"
                        min="1"
                        placeholder="e.g., 20"
                        value={topic.count}
                        onChange={(e) =>
                          handleTopicChange(topic.id, 'count', e.target.value)
                        }
                      />
                    </div>

                    {/* Weightage */}
                    <div className="md:col-span-3">
                      <Input
                        label="Weightage (%)"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="e.g., 40"
                        value={topic.weightage}
                        onChange={(e) =>
                          handleTopicChange(topic.id, 'weightage', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addTopicRow}
              className="mt-4 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Topic
            </button>
          </section>

          {/* ─── Section 4: Difficulty Distribution ─── */}
          <section>
            <h2
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                style={{ color: 'var(--color-brand-blue)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Difficulty Distribution
            </h2>

            {errors.difficultyDistribution && (
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-error)' }}
                role="alert"
              >
                {errors.difficultyDistribution}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <Input
                label="Easy (%)"
                type="number"
                min="0"
                max="100"
                placeholder="30"
                value={formData.difficultyDistribution.EASY}
                onChange={(e) => handleDifficultyChange('EASY', e.target.value)}
              />
              <Input
                label="Moderate (%)"
                type="number"
                min="0"
                max="100"
                placeholder="50"
                value={formData.difficultyDistribution.MODERATE}
                onChange={(e) => handleDifficultyChange('MODERATE', e.target.value)}
              />
              <Input
                label="Difficult (%)"
                type="number"
                min="0"
                max="100"
                placeholder="20"
                value={formData.difficultyDistribution.DIFFICULT}
                onChange={(e) => handleDifficultyChange('DIFFICULT', e.target.value)}
              />
            </div>

            {/* Difficulty Total Bar */}
            <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Total
                </span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color:
                      difficultyTotal === 100
                        ? 'var(--color-success)'
                        : 'var(--color-error)',
                  }}
                >
                  {difficultyTotal}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(difficultyTotal, 100)}%`,
                    backgroundColor:
                      difficultyTotal === 100
                        ? 'var(--color-success)'
                        : difficultyTotal > 100
                          ? 'var(--color-error)'
                          : 'var(--color-warning)',
                  }}
                />
              </div>
            </div>
          </section>

          {/* ─── Section 5: Constraints ─── */}
          <section>
            <h2
              className="font-roboto text-base md:text-lg font-bold border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center gap-2"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                style={{ color: 'var(--color-brand-blue)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Validation Constraints
            </h2>

            {errors.constraints && (
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-error)' }}
                role="alert"
              >
                {errors.constraints}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Input
                label="No Repeat Within (Days)"
                type="number"
                min="0"
                placeholder="e.g., 30"
                value={formData.constraints.noRepeatWithinDays}
                onChange={(e) =>
                  handleConstraintChange('noRepeatWithinDays', e.target.value)
                }
                helperText="Days before a question can repeat"
              />
              <Input
                label="Max Usage Count"
                type="number"
                min="1"
                placeholder="e.g., 5"
                value={formData.constraints.maxUsageCount}
                onChange={(e) =>
                  handleConstraintChange('maxUsageCount', e.target.value)
                }
                helperText="Max times a question can appear"
              />
              <div className="flex items-end pb-1">
                <Toggle
                  label="Avoid Previously Failed"
                  checked={formData.constraints.avoidPreviouslyFailed}
                  onChange={(checked) =>
                    handleConstraintChange('avoidPreviouslyFailed', checked)
                  }
                />
              </div>
            </div>
          </section>

          {/* ─── Form Actions ─── */}
          <div className="pt-6 md:pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
            <button
              type="button"
              onClick={handleDiscard}
              className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 font-bold rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
              style={{
                backgroundColor: 'var(--color-brand-gold)',
                color: 'var(--color-brand-navy)',
              }}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {isSubmitting ? 'UPDATING...' : 'UPDATE TEMPLATE'}
            </button>
          </div>
        </form>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
