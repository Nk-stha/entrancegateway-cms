'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Input } from '@/components/ui/Input';
import { useNotes } from '@/hooks/useNotes';

export default function NotesPage() {
  const {
    notesList,
    loading,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    filters,
    sortBy,
    sortDir,
    handlePageChange,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
    handleSort,
    handleDownload,
    handleDelete,
  } = useNotes();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (noteId: number) => {
    window.location.href = `/dashboard/notes/edit/${noteId}`;
  };

  const openDeleteModal = (noteId: number, noteName: string) => {
    setNoteToDelete({ id: noteId, name: noteName });
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setDeleteModalOpen(false);
      setNoteToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    setDeleting(true);
    try {
      const success = await handleDelete(noteToDelete.id);
      if (success) {
        setDeleteModalOpen(false);
        setNoteToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDir === 'asc' ? (
      <svg className="w-4 h-4" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" style={{ color: 'var(--color-brand-blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    const actualItemsOnPage = Math.min(notesList.length, pageSize);
    const showingFrom = totalElements > 0 ? currentPage * pageSize + 1 : 0;
    const showingTo = totalElements > 0 ? currentPage * pageSize + actualItemsOnPage : 0;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-gray-700">
            {totalElements > 0 ? (
              <>
                Showing <span className="font-medium">{showingFrom}</span> to{' '}
                <span className="font-medium">{showingTo}</span> of{' '}
                <span className="font-medium">{totalElements}</span> results
              </>
            ) : (
              'No results'
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {pages.map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === page
                    ? 'border-brand-blue text-white'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                style={currentPage === page ? { backgroundColor: 'var(--color-brand-blue)' } : {}}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
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
                Notes Management
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Browse and download course notes
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard/notes/create'}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-brand-blue)' }}
            >
              Create Note
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Affiliation"
                type="text"
                placeholder="e.g., TU, PU"
                value={filters.affiliation}
                onChange={(e) => handleFilterChange('affiliation', e.target.value)}
              />
              <Input
                label="Course Name"
                type="text"
                placeholder="e.g., BSc. CSIT"
                value={filters.courseName}
                onChange={(e) => handleFilterChange('courseName', e.target.value)}
              />
              <Input
                label="Semester"
                type="number"
                placeholder="e.g., 1, 2, 3"
                value={filters.semester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-brand-blue)' }}
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Table - Desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: 'var(--color-gray-50)' }}>
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('subject')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSort('subject');
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Sort by subject"
                    >
                      <div className="flex items-center gap-2">
                        Subject
                        {getSortIcon('subject')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('subjectCode')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSort('subjectCode');
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Sort by subject code"
                    >
                      <div className="flex items-center gap-2">
                        Code
                        {getSortIcon('subjectCode')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affiliation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
                        </div>
                      </td>
                    </tr>
                  ) : notesList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No notes found
                      </td>
                    </tr>
                  ) : (
                    notesList.map((note) => (
                      <tr 
                        key={note.noteId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{note.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{note.subjectCode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{note.courseName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{note.semester}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{note.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{note.affiliation.replace(/_/g, ' ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(note.noteId);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                              aria-label="Edit note"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(note.noteId, note.subject);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                              aria-label="Delete note"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </div>

          {/* Cards - Mobile/Tablet */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-brand-blue)' }}></div>
              </div>
            ) : notesList.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                No notes found
              </div>
            ) : (
              notesList.map((note) => (
                <div key={note.noteId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{note.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{note.subjectCode}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Course:</span>
                        <span className="ml-1 font-medium">{note.courseName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Semester:</span>
                        <span className="ml-1 font-medium">{note.semester}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Year:</span>
                        <span className="ml-1 font-medium">{note.year}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Affiliation:</span>
                        <span className="ml-1 font-medium">{note.affiliation.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEdit(note.noteId)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--color-brand-blue)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(note.noteId, note.subject)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--color-error)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {renderPagination()}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={closeDeleteModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: 'var(--color-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900 mb-2">
                    Delete Note
                  </h3>
                  <p id="delete-modal-description" className="text-sm text-gray-600 mb-4">
                    Are you sure you want to delete "{noteToDelete?.name}"? This action cannot be undone and will also remove the associated file.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={confirmDelete}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--color-error)' }}
                    >
                      {deleting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Deleting...
                        </span>
                      ) : (
                        'Delete'
                      )}
                    </button>
                    <button
                      onClick={closeDeleteModal}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
