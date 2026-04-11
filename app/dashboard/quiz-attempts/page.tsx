'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { quizAttemptService } from '@/services/quizAttempt.service';
import { toast } from '@/lib/utils/toast';
import type { QuizAttemptApiResponse } from '@/types/quiz.types';

function formatAttemptedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getSnapshotCount(snapshotJson: string): string {
  try {
    const parsed = JSON.parse(snapshotJson);
    if (Array.isArray(parsed)) {
      return `${parsed.length} questions`;
    }
    return 'Snapshot available';
  } catch {
    return 'Snapshot available';
  }
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? '*'}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

export default function QuizAttemptsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttemptApiResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttemptApiResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAttempts = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await quizAttemptService.getAttempts({
        page,
        size: pageSize,
        sortDir: 'asc',
      });

      if (result.error) {
        setAttempts([]);
        setTotalElements(0);
        setTotalPages(0);
        setCurrentPage(0);
        setError(result.error);
        return false;
      }

      setAttempts(result.attempts);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
      return true;
    } catch {
      setAttempts([]);
      setTotalElements(0);
      setTotalPages(0);
      setCurrentPage(0);
      setError('Unable to load quiz attempts. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [page]);

  const handleDelete = (attempt: QuizAttemptApiResponse) => {
    setSelectedAttempt(attempt);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAttempt) return;

    setDeleting(true);

    try {
      const attemptId = selectedAttempt.attemptId;
      const maskedEmail = maskEmail(selectedAttempt.user.email);
      const result = await quizAttemptService.deleteAttempt(attemptId);

      if (result.success) {
        setShowDeleteModal(false);
        setSelectedAttempt(null);

        const refreshSucceeded = await fetchAttempts();

        if (refreshSucceeded) {
          toast.success('Quiz attempt deleted successfully', {
            description: `Attempt #${attemptId} has been removed.`,
          });
        } else {
          toast.error('Quiz attempt deleted, but the updated list could not be refreshed.', {
            description: `Deleted attempt #${attemptId} for ${maskedEmail}. Please refresh the page.`,
          });
        }
      } else {
        toast.error(result.error || 'Failed to delete quiz attempt');
      }
    } catch {
      toast.error('An unexpected error occurred while deleting the quiz attempt.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'attemptId',
      label: 'Attempt ID',
      className: 'w-24',
      render: (attempt: QuizAttemptApiResponse) => (
        <span className="font-semibold text-gray-900">#{attempt.attemptId}</span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (attempt: QuizAttemptApiResponse) => (
        <div>
          <p className="font-medium text-gray-900 break-all">{maskEmail(attempt.user.email)}</p>
          <p className="text-xs text-gray-500">User ID: {attempt.user.userId}</p>
        </div>
      ),
    },
    {
      key: 'quizTemplate',
      label: 'Quiz Template',
      render: (attempt: QuizAttemptApiResponse) => (
        <div>
          <p className="font-medium text-gray-900">{attempt.quizTemplate.name}</p>
          <p className="text-xs text-gray-500 break-all">
            Template ID: {attempt.quizTemplate.templateId}
          </p>
        </div>
      ),
    },
    {
      key: 'score',
      label: 'Score',
      className: 'w-24',
      render: (attempt: QuizAttemptApiResponse) => (
        <span className="text-sm font-semibold text-gray-900">{attempt.score}</span>
      ),
    },
    {
      key: 'status',
      label: 'Submitted',
      className: 'w-32',
      render: (attempt: QuizAttemptApiResponse) => (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: attempt.isSubmitted
              ? 'rgba(46, 125, 50, 0.1)'
              : 'rgba(249, 168, 37, 0.1)',
            color: attempt.isSubmitted ? 'var(--color-success)' : 'var(--color-warning)',
          }}
        >
          {attempt.isSubmitted ? 'Submitted' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'attemptedAt',
      label: 'Attempted At',
      className: 'w-44',
      render: (attempt: QuizAttemptApiResponse) => (
        <span className="text-sm text-gray-700">{formatAttemptedAt(attempt.attemptedAt)}</span>
      ),
    },
    {
      key: 'snapshot',
      label: 'Snapshot',
      className: 'w-32',
      render: (attempt: QuizAttemptApiResponse) => (
        <span className="text-sm text-gray-600">
          {getSnapshotCount(attempt.questionsSnapshotJson)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-28',
      render: (attempt: QuizAttemptApiResponse) => (
        <button
          onClick={() => handleDelete(attempt)}
          className="px-3 py-1 text-sm font-medium rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--color-error)',
            color: 'white',
          }}
        >
          Delete
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading quiz attempts..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold font-roboto"
              style={{ color: 'var(--color-brand-navy)' }}
            >
              Quiz Attempts
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              View and manage all quiz attempts across all templates
            </p>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                color: 'var(--color-error)',
                border: '1px solid rgba(211, 47, 47, 0.2)',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
              columns={columns}
              data={attempts}
              keyExtractor={(attempt) => attempt.attemptId.toString()}
              emptyMessage="No quiz attempts found"
              mobileCardRender={(attempt) => (
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 break-all">
                        {maskEmail(attempt.user.email)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Attempt #{attempt.attemptId}</p>
                    </div>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: attempt.isSubmitted
                          ? 'rgba(46, 125, 50, 0.1)'
                          : 'rgba(249, 168, 37, 0.1)',
                        color: attempt.isSubmitted ? 'var(--color-success)' : 'var(--color-warning)',
                      }}
                    >
                      {attempt.isSubmitted ? 'Submitted' : 'Draft'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      Template: {attempt.quizTemplate.name}
                    </p>
                    <p className="text-xs text-gray-500 break-all">
                      Template ID: {attempt.quizTemplate.templateId}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Score: </span>
                      <span className="font-semibold text-gray-900">{attempt.score}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">User ID: </span>
                      <span className="font-semibold text-gray-900">{attempt.user.userId}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Attempted At: </span>
                      <span className="font-semibold text-gray-900">
                        {formatAttemptedAt(attempt.attemptedAt)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Snapshot: </span>
                      <span className="font-semibold text-gray-900">
                        {getSnapshotCount(attempt.questionsSnapshotJson)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleDelete(attempt)}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--color-error)',
                        color: 'white',
                      }}
                    >
                      Delete
                    </button>
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
          isOpen={showDeleteModal}
          title="Delete Quiz Attempt"
          message={`Are you sure you want to delete attempt #${selectedAttempt?.attemptId} for ${selectedAttempt ? maskEmail(selectedAttempt.user.email) : 'this user'}? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedAttempt(null);
          }}
          variant="danger"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
