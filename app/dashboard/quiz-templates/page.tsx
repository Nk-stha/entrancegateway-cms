'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useQuizTemplates } from '@/hooks/useQuizTemplates';
import { quizTemplateService } from '@/services/quizTemplate.service';
import { toast } from '@/lib/utils/toast';
import type { QuizTemplateMutationResponse } from '@/types/quiz.types';

function getStatusStyle(status: string): { bg: string; text: string } {
  switch (status) {
    case 'PUBLISHED':
      return { bg: 'rgba(46, 125, 50, 0.1)', text: 'var(--color-success)' };
    case 'DRAFT':
      return { bg: 'rgba(249, 168, 37, 0.1)', text: 'var(--color-warning)' };
    case 'ARCHIVED':
      return { bg: 'var(--color-gray-100)', text: 'var(--color-gray-500)' };
    default:
      return { bg: 'var(--color-gray-100)', text: 'var(--color-gray-500)' };
  }
}

function getTypeLabel(type: string): string {
  return type === 'PRACTICE' ? 'Practice' : 'Competitive';
}

export default function QuizTemplatesPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const {
    templates,
    loading,
    totalElements,
    totalPages,
    currentPage,
    refetch,
  } = useQuizTemplates({ page, size: pageSize, sortBy: 'createdAt', sortDir: 'desc' });

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuizTemplateMutationResponse | null>(null);
  const [archiving, setArchiving] = useState(false);

  const handleArchive = (template: QuizTemplateMutationResponse) => {
    setSelectedTemplate(template);
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async () => {
    if (!selectedTemplate) return;

    setArchiving(true);

    const result = await quizTemplateService.deleteQuizTemplate(selectedTemplate.templateId);

    if (result.success) {
      toast.success('Quiz template archived successfully', {
        description: `"${selectedTemplate.name}" has been archived.`,
      });
      setShowArchiveModal(false);
      setSelectedTemplate(null);
      refetch();
    } else {
      toast.error(result.error || 'Failed to archive quiz template');
    }

    setArchiving(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Template Name',
      render: (item: QuizTemplateMutationResponse) => (
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      className: 'w-28',
      render: (item: QuizTemplateMutationResponse) => (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
          style={{
            backgroundColor: item.type === 'PRACTICE' ? 'rgba(13, 71, 161, 0.08)' : 'rgba(156, 39, 176, 0.08)',
            color: item.type === 'PRACTICE' ? 'var(--color-brand-blue)' : '#9C27B0',
          }}
        >
          {getTypeLabel(item.type)}
        </span>
      ),
    },
    {
      key: 'config',
      label: 'Questions / Marks',
      className: 'w-36',
      render: (item: QuizTemplateMutationResponse) => (
        <span className="text-sm">
          {item.config.totalQuestions} Q / {item.config.totalMarks} M
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      className: 'w-24',
      render: (item: QuizTemplateMutationResponse) => (
        <span className="text-sm">{item.config.durationMinutes} min</span>
      ),
    },
    {
      key: 'entryFee',
      label: 'Fee',
      className: 'w-24',
      render: (item: QuizTemplateMutationResponse) => (
        <span className={item.entryFee === 0 ? 'text-green-600 font-semibold text-sm' : 'text-sm'}>
          {item.entryFee === 0 ? 'Free' : `Rs. ${item.entryFee}`}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-28',
      render: (item: QuizTemplateMutationResponse) => {
        const style = getStatusStyle(item.status);
        return (
          <span
            className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-44',
      render: (item: QuizTemplateMutationResponse) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/quiz-templates/${item.templateId}/edit`}
            className="px-3 py-1 text-sm font-medium rounded-lg transition-colors text-white"
            style={{ backgroundColor: 'var(--color-brand-blue)' }}
          >
            Edit
          </Link>
          {item.status !== 'ARCHIVED' && (
            <button
              onClick={() => handleArchive(item)}
              className="px-3 py-1 text-sm font-medium rounded-lg transition-colors text-white"
              style={{ backgroundColor: 'var(--color-error)' }}
            >
              Archive
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading quiz templates..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold font-roboto"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Quiz Template Management
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Manage quiz templates for practice and competitive exams
              </p>
            </div>
            <Link
              href="/dashboard/quiz-templates/create"
              className="px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors text-white text-sm"
              style={{ backgroundColor: 'var(--color-brand-blue)' }}
            >
              Create Template
            </Link>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
              columns={columns}
              data={templates}
              keyExtractor={(item) => item.templateId}
              emptyMessage="No quiz templates found"
              mobileCardRender={(item) => (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span
                      className="ml-2 inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                      style={{
                        backgroundColor: getStatusStyle(item.status).bg,
                        color: getStatusStyle(item.status).text,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Type: </span>
                      <span className="font-semibold">{getTypeLabel(item.type)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fee: </span>
                      <span className="font-semibold">
                        {item.entryFee === 0 ? 'Free' : `Rs. ${item.entryFee}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Questions: </span>
                      <span className="font-semibold">{item.config.totalQuestions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration: </span>
                      <span className="font-semibold">{item.config.durationMinutes} min</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Link
                      href={`/dashboard/quiz-templates/${item.templateId}/edit`}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-center text-white"
                      style={{ backgroundColor: 'var(--color-brand-blue)' }}
                    >
                      Edit
                    </Link>
                    {item.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleArchive(item)}
                        className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-white"
                        style={{ backgroundColor: 'var(--color-error)' }}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              )}
            />

            {totalPages > 1 && (
              <div className="px-6 pb-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>

        <ConfirmModal
          isOpen={showArchiveModal}
          title="Archive Quiz Template"
          message={`Are you sure you want to archive "${selectedTemplate?.name}"? This will set the template status to ARCHIVED. This action can be reversed by editing the template.`}
          confirmLabel="Archive"
          loading={archiving}
          onConfirm={handleConfirmArchive}
          onCancel={() => {
            setShowArchiveModal(false);
            setSelectedTemplate(null);
          }}
          variant="danger"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
