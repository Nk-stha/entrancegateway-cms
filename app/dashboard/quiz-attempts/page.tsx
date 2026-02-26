'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { quizAttemptService } from '@/services/quizAttempt.service';
import { toast } from '@/lib/utils/toast';
import type { QuizAttemptApiResponse } from '@/types/quiz.types';

export default function QuizAttemptsPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttemptApiResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttemptApiResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAttempts = async () => {
    setLoading(true);
    const result = await quizAttemptService.getAttempts({
      page,
      size: pageSize,
      sortBy: 'attemptId',
      sortDir: 'desc',
    });

    setAttempts(result.attempts);
    setTotalElements(result.totalElements);
    setTotalPages(result.totalPages);
    setCurrentPage(result.currentPage);
    setLoading(false);
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

    const result = await quizAttemptService.deleteAttempt(selectedAttempt.attemptId);

    if (result.success) {
      toast.success('Quiz attempt deleted successfully');
      setShowDeleteModal(false);
      fetchAttempts();
    } else {
      toast.error(result.error || 'Failed to delete quiz attempt');
    }

    setDeleting(false);
  };

  const columns = [
    {
      key: 'attemptId',
      label: 'ID',
      className: 'w-20',
    },
    {
      key: 'user',
      label: 'User',
      render: (attempt: QuizAttemptApiResponse) => (
        <div>
          <p className="font-medium text-gray-900">{attempt.user.fullname}</p>
          <p className="text-xs text-gray-500">ID: {attempt.user.userId}</p>
        </div>
      ),
    },
    {
      key: 'questionSet',
      label: 'Quiz Set',
      render: (attempt: QuizAttemptApiResponse) => (
        <div>
          <p className="font-medium text-gray-900">{attempt.questionSet.setName}</p>
          <p className="text-xs text-gray-500">ID: {attempt.questionSet.setId}</p>
        </div>
      ),
    },
    {
      key: 'question',
      label: 'Question',
      render: (attempt: QuizAttemptApiResponse) => (
        <p className="text-sm text-gray-700 line-clamp-2">
          {attempt.mcqQuestion.question}
        </p>
      ),
    },
    {
      key: 'result',
      label: 'Result',
      className: 'w-32',
      render: (attempt: QuizAttemptApiResponse) => (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: attempt.isCorrect
              ? 'rgba(46, 125, 50, 0.1)'
              : 'rgba(211, 47, 47, 0.1)',
            color: attempt.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
          }}
        >
          {attempt.isCorrect ? 'Correct' : 'Incorrect'}
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
              View and manage all quiz attempts by users
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
              columns={columns}
              data={attempts}
              keyExtractor={(attempt) => attempt.attemptId.toString()}
              emptyMessage="No quiz attempts found"
              mobileCardRender={(attempt) => (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{attempt.user.fullname}</p>
                      <p className="text-xs text-gray-500 mt-1">User ID: {attempt.user.userId}</p>
                    </div>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: attempt.isCorrect
                          ? 'rgba(46, 125, 50, 0.1)'
                          : 'rgba(211, 47, 47, 0.1)',
                        color: attempt.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                      }}
                    >
                      {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      Quiz: {attempt.questionSet.setName}
                    </p>
                    <p className="text-xs text-gray-500">Set ID: {attempt.questionSet.setId}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Question:</p>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {attempt.mcqQuestion.question}
                    </p>
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
          message={`Are you sure you want to delete this quiz attempt by ${selectedAttempt?.user.fullname}? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          variant="danger"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
