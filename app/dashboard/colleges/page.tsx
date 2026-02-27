'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { useColleges } from '@/hooks/useColleges';
import { collegeService } from '@/services/college.service';
import type {
  College,
  CollegeFormData,
  CollegeType,
  CollegeAffiliation,
  CollegePriority,
} from '@/types/college.types';

export default function CollegesPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { colleges, loading, totalElements, totalPages, currentPage, refetch } = useColleges({
    page,
    size: pageSize,
    sortBy: 'collegeName',
    sortDir: 'asc',
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState<CollegeFormData>({
    collegeName: '',
    email: '',
    location: '',
    collegeType: 'PRIVATE',
    affiliation: 'TRIBHUVAN_UNIVERSITY',
    priority: 'MEDIUM',
    description: '',
    website: '',
    contact: '',
    establishedYear: '',
    latitude: undefined,
    longitude: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const handleCreate = () => {
    setFormData({
      collegeName: '',
      email: '',
      location: '',
      collegeType: 'PRIVATE',
      affiliation: 'TRIBHUVAN_UNIVERSITY',
      priority: 'MEDIUM',
      description: '',
      website: '',
      contact: '',
      establishedYear: '',
      latitude: undefined,
      longitude: undefined,
    });
    setShowCreateModal(true);
  };

  const handleView = async (college: College) => {
    setViewLoading(true);
    setShowViewModal(true);
    const fullCollege = await collegeService.getCollegeById(college.collegeId);
    if (fullCollege) {
      setSelectedCollege(fullCollege);
    } else {
      setSelectedCollege(college);
    }
    setViewLoading(false);
  };

  const handleDelete = (college: College) => {
    setSelectedCollege(college);
    setShowDeleteModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await collegeService.createCollege(formData);

    if (result.success) {
      setShowCreateModal(false);
      refetch();
    }

    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCollege) return;

    setDeleting(true);

    const success = await collegeService.deleteCollege(selectedCollege.collegeId);

    if (success) {
      setShowDeleteModal(false);
      refetch();
    }

    setDeleting(false);
  };

  const getPriorityColor = (priority: CollegePriority) => {
    const colors = {
      HIGH: 'bg-blue-100 text-blue-700',
      MEDIUM: 'bg-gray-200 text-gray-600',
      LOW: 'bg-gray-100 text-gray-500',
    };
    return colors[priority];
  };

  const getTypeBadgeColor = (type: CollegeType) => {
    return type === 'PRIVATE' ? 'text-gray-600' : 'text-gray-600';
  };

  const formatAffiliation = (affiliation: CollegeAffiliation) => {
    return affiliation.replace(/_/g, '_');
  };

  if (loading && colleges.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading colleges..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold font-roboto"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                College Management
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Manage institutional profiles, affiliations, and status
              </p>
            </div>
            <Link
              href="/dashboard/colleges/create"
              className="px-6 py-2.5 font-bold rounded shadow-sm transition-all text-sm tracking-wide inline-flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-brand-gold)', color: 'var(--color-brand-navy)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              CREATE COLLEGE
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {colleges.length === 0 ? (
              <EmptyState type="empty" message="No colleges found" />
            ) : (
              <>
                {/* Desktop Table View - Hidden on small/medium devices */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                          ID
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                          Logo
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          College Name
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Affiliation
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {colleges.map((college) => (
                        <tr
                          key={college.collegeId}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-400">
                            {college.collegeId}
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-10 w-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden relative">
                              {college.logoName ? (
                                <Image
                                  src={college.logoName}
                                  alt={college.collegeName}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <svg
                                  className="w-5 h-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="font-semibold"
                              style={{ color: 'var(--color-brand-navy)' }}
                            >
                              {college.collegeName}
                            </div>
                            <div className="text-xs text-gray-500">{college.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{college.location}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 text-gray-700 rounded uppercase tracking-tighter border border-gray-200">
                              {formatAffiliation(college.affiliation)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${getTypeBadgeColor(college.collegeType)}`}>
                              {college.collegeType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-[11px] font-bold rounded-full ${getPriorityColor(
                                college.priority
                              )}`}
                            >
                              {college.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleView(college)}
                                className="p-1.5 text-gray-400 hover:bg-blue-50 rounded transition-colors"
                                style={{ color: 'var(--color-brand-blue)' }}
                                title="View"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                              <Link
                                href={`/dashboard/colleges/${college.collegeId}/courses`}
                                className="p-1.5 text-gray-400 hover:bg-green-50 rounded transition-colors"
                                style={{ color: 'var(--color-success)' }}
                                title="Manage Courses"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                  />
                                </svg>
                              </Link>
                              <Link
                                href={`/dashboard/colleges/edit/${college.collegeId}`}
                                className="p-1.5 text-gray-400 hover:bg-amber-50 rounded transition-colors"
                                style={{ color: 'var(--color-warning)' }}
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </Link>
                              <button
                                onClick={() => handleDelete(college)}
                                className="p-1.5 text-gray-400 hover:bg-red-50 rounded transition-colors"
                                style={{ color: 'var(--color-error)' }}
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View - Shown on small/medium devices */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {colleges.map((college) => (
                    <div
                      key={college.collegeId}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-12 w-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                          {college.logoName ? (
                            <Image
                              src={college.logoName}
                              alt={college.collegeName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-sm truncate"
                            style={{ color: 'var(--color-brand-navy)' }}
                          >
                            {college.collegeName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">{college.email}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${getPriorityColor(
                            college.priority
                          )}`}
                        >
                          {college.priority}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-gray-600 truncate">{college.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-700 rounded uppercase tracking-tighter border border-gray-200">
                            {college.collegeType}
                          </span>
                          <span className="text-[10px] text-gray-500 truncate">
                            {formatAffiliation(college.affiliation)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(college)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                            style={{ backgroundColor: 'var(--color-brand-blue)', color: 'white' }}
                          >
                            View
                          </button>
                          <Link
                            href={`/dashboard/colleges/${college.collegeId}/courses`}
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors text-center"
                            style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
                          >
                            Courses
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/colleges/edit/${college.collegeId}`}
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors text-center"
                            style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(college)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors"
                            style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="px-4 lg:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500">
                      Showing <span className="font-semibold text-gray-900">{colleges.length}</span> of{' '}
                      <span className="font-semibold text-gray-900">{totalElements}</span> elements
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalElements={totalElements}
                      pageSize={pageSize}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <FormModal
          isOpen={showCreateModal}
          title="Create College"
          onClose={() => setShowCreateModal(false)}
          size="lg"
        >
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <Input
              label="College Name"
              type="text"
              value={formData.collegeName}
              onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
              required
              placeholder="e.g., Advanced Engineering College"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="info@college.edu.np"
              />

              <Input
                label="Contact"
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+977-1-XXXXXXX"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="e.g., Kathmandu, Nepal"
              />

              <Input
                label="Established Year"
                type="text"
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                placeholder="e.g., 1990"
              />
            </div>

            <Input
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.college.edu.np"
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the college"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Type"
                options={[
                  { value: 'PRIVATE', label: 'Private' },
                  { value: 'GOVERNMENT', label: 'Government' },
                ]}
                value={formData.collegeType}
                onChange={(e) => setFormData({ ...formData, collegeType: e.target.value as CollegeType })}
              />

              <Select
                label="Affiliation"
                options={[
                  { value: 'TRIBHUVAN_UNIVERSITY', label: 'Tribhuvan University' },
                  { value: 'KATHMANDU_UNIVERSITY', label: 'Kathmandu University' },
                  { value: 'POKHARA_UNIVERSITY', label: 'Pokhara University' },
                  { value: 'PURWANCHAL_UNIVERSITY', label: 'Purwanchal University' },
                  { value: 'LUMBINI_UNIVERSITY', label: 'Lumbini University' },
                  { value: 'FAR_WESTERN_UNIVERSITY', label: 'Far Western University' },
                  { value: 'MID_WESTERN_UNIVERSITY', label: 'Mid Western University' },
                  { value: 'NEB', label: 'NEB' },
                  { value: 'CAMPUS_AFFILIATED_TO_FOREIGN_UNIVERSITY', label: 'Foreign University' },
                ]}
                value={formData.affiliation}
                onChange={(e) =>
                  setFormData({ ...formData, affiliation: e.target.value as CollegeAffiliation })
                }
              />

              <Select
                label="Priority"
                options={[
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'LOW', label: 'Low' },
                ]}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as CollegePriority })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50 text-white"
                style={{ backgroundColor: 'var(--color-brand-blue)' }}
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </FormModal>

        <FormModal
          isOpen={showViewModal}
          title="College Details"
          onClose={() => setShowViewModal(false)}
          size="lg"
        >
          {viewLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
          ) : selectedCollege && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  {selectedCollege.logoName ? (
                    <img
                      src={`/uploads/logos/${selectedCollege.logoName}`}
                      alt={selectedCollege.collegeName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedCollege.collegeName}</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {selectedCollege.collegeId}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(
                    selectedCollege.priority
                  )}`}
                >
                  {selectedCollege.priority}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</h4>
                  <p className="text-sm text-gray-900">{selectedCollege.email}</p>
                </div>

                {selectedCollege.contact && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contact</h4>
                    <p className="text-sm text-gray-900">{selectedCollege.contact}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Location</h4>
                  <p className="text-sm text-gray-900">{selectedCollege.location}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</h4>
                  <span className="text-sm font-medium text-gray-900">{selectedCollege.collegeType}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Affiliation</h4>
                  <p className="text-sm text-gray-900">{selectedCollege.affiliation.replace(/_/g, ' ')}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Courses</h4>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedCollege.courses?.length || 0} courses
                  </p>
                </div>

                {selectedCollege.establishedYear && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Established</h4>
                    <p className="text-sm text-gray-900">{selectedCollege.establishedYear}</p>
                  </div>
                )}

                {selectedCollege.website && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Website</h4>
                    <a
                      href={selectedCollege.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                      style={{ color: 'var(--color-brand-blue)' }}
                    >
                      {selectedCollege.website}
                    </a>
                  </div>
                )}
              </div>

              {selectedCollege.description && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                    {selectedCollege.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white"
                  style={{ backgroundColor: 'var(--color-brand-blue)' }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </FormModal>

        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete College"
          message={`Are you sure you want to delete "${selectedCollege?.collegeName}"? This action cannot be undone.`}
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
