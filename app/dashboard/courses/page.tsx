'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useCourses } from '@/hooks/useCourses';
import { courseService } from '@/services/course.service';
import { toast } from '@/lib/utils/toast';
import type { Course, CourseFormData, CourseLevel, CourseType } from '@/types/quiz.types';

export default function CoursesPage() {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { courses, loading, totalElements, totalPages, currentPage, refetch } = useCourses({
    page,
    size: pageSize,
    sortBy: 'courseName',
    sortDir: 'asc',
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    courseName: '',
    affiliation: 'TRIBHUVAN_UNIVERSITY',
    description: '',
    criteria: '',
    courseLevel: 'BACHELOR',
    courseType: 'SEMESTER',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = () => {
    setFormData({
      courseName: '',
      affiliation: 'TRIBHUVAN_UNIVERSITY',
      description: '',
      criteria: '',
      courseLevel: 'BACHELOR',
      courseType: 'SEMESTER',
    });
    setShowCreateModal(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      courseName: course.courseName,
      affiliation: course.affiliation,
      description: course.description,
      criteria: course.criteria,
      courseLevel: course.courseLevel,
      courseType: course.courseType,
    });
    setShowEditModal(true);
  };

  const handleDelete = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const success = await courseService.createCourse(formData);

    if (success) {
      toast.success('Course created successfully');
      setShowCreateModal(false);
      refetch();
    } else {
      toast.error('Failed to create course');
    }

    setSubmitting(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setSubmitting(true);

    const success = await courseService.updateCourse(selectedCourse.id, formData);

    if (success) {
      toast.success('Course updated successfully');
      setShowEditModal(false);
      refetch();
    } else {
      toast.error('Failed to update course');
    }

    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;

    setDeleting(true);

    const success = await courseService.deleteCourse(selectedCourse.id);

    if (success) {
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      refetch();
    } else {
      toast.error('Failed to delete course');
    }

    setDeleting(false);
  };

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      PLUS_TWO: 'var(--color-brand-gold)',
      DIPLOMA: 'var(--color-warning)',
      BACHELOR: 'var(--color-brand-blue)',
      MASTER: 'var(--color-success)',
      M_PHIL: 'var(--color-brand-navy)',
      PHD: 'var(--color-error)',
    };
    return colors[level] || 'var(--color-gray-500)';
  };

  const formatLevel = (level: string) => {
    const labels: Record<string, string> = {
      PLUS_TWO: 'Plus Two',
      DIPLOMA: 'Diploma',
      BACHELOR: 'Bachelor',
      MASTER: 'Master',
      M_PHIL: 'M.Phil',
      PHD: 'PhD',
    };
    return labels[level] || level;
  };

  const formatType = (type: string) => {
    const labels: Record<string, string> = {
      ANNUAL: 'Annual',
      SEMESTER: 'Semester',
    };
    return labels[type] || type;
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-20',
    },
    {
      key: 'courseName',
      label: 'Course Name',
    },
    {
      key: 'affiliation',
      label: 'Affiliation',
      className: 'w-32',
    },
    {
      key: 'courseLevel',
      label: 'Level',
      className: 'w-32',
      render: (course: Course) => (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: getLevelBadgeColor(course.courseLevel) }}
        >
          {formatLevel(course.courseLevel)}
        </span>
      ),
    },
    {
      key: 'courseType',
      label: 'Type',
      className: 'w-28',
      render: (course: Course) => formatType(course.courseType),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-56',
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(course)}
            className="px-3 py-1 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-brand-blue)',
              color: 'white',
            }}
          >
            Edit
          </button>
          <Link
            href={`/dashboard/question-sets?courseId=${course.id}`}
            className="px-3 py-1 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-success)',
              color: 'white',
            }}
          >
            Quizzes
          </Link>
          <button
            onClick={() => handleDelete(course)}
            className="px-3 py-1 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-error)',
              color: 'white',
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading courses..." />
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
                Course Management
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Manage educational courses and programs
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors text-white"
              style={{ backgroundColor: 'var(--color-brand-blue)' }}
            >
              Add Course
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <DataTable
              columns={columns}
              data={courses}
              keyExtractor={(course) => course.id.toString()}
              emptyMessage="No courses found"
              mobileCardRender={(course) => (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{course.courseName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {course.affiliation} • ID: {course.id}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: getLevelBadgeColor(course.courseLevel) }}
                    >
                      {formatLevel(course.courseLevel)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="line-clamp-2">{course.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {formatType(course.courseType)}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(course)}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--color-brand-blue)',
                        color: 'white',
                      }}
                    >
                      Edit
                    </button>
                    <Link
                      href={`/dashboard/question-sets?courseId=${course.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-center"
                      style={{
                        backgroundColor: 'var(--color-success)',
                        color: 'white',
                      }}
                    >
                      Quizzes
                    </Link>
                    <button
                      onClick={() => handleDelete(course)}
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

        <FormModal
          isOpen={showCreateModal}
          title="Create Course"
          onClose={() => setShowCreateModal(false)}
          size="lg"
        >
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <Input
              label="Course Name"
              type="text"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              required
              placeholder="e.g., BSc CSIT"
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
                { value: 'NEB', label: 'NEB (National Examination Board)' },
                { value: 'CAMPUS_AFFILIATED_TO_FOREIGN_UNIVERSITY', label: 'Foreign University Affiliated' },
              ]}
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Brief description of the course"
              rows={3}
            />

            <Textarea
              label="Criteria"
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              required
              placeholder="Admission criteria and requirements"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Course Level"
                options={[
                  { value: 'PLUS_TWO', label: 'Plus Two' },
                  { value: 'DIPLOMA', label: 'Diploma' },
                  { value: 'BACHELOR', label: 'Bachelor' },
                  { value: 'MASTER', label: 'Master' },
                  { value: 'M_PHIL', label: 'M.Phil' },
                  { value: 'PHD', label: 'PhD' },
                ]}
                value={formData.courseLevel}
                onChange={(e) => setFormData({ ...formData, courseLevel: e.target.value as CourseLevel })}
              />

              <Select
                label="Course Type"
                options={[
                  { value: 'ANNUAL', label: 'Annual' },
                  { value: 'SEMESTER', label: 'Semester' },
                ]}
                value={formData.courseType}
                onChange={(e) => setFormData({ ...formData, courseType: e.target.value as CourseType })}
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
          isOpen={showEditModal}
          title="Edit Course"
          onClose={() => setShowEditModal(false)}
          size="lg"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <Input
              label="Course Name"
              type="text"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              required
              placeholder="e.g., BSc CSIT"
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
                { value: 'NEB', label: 'NEB (National Examination Board)' },
                { value: 'CAMPUS_AFFILIATED_TO_FOREIGN_UNIVERSITY', label: 'Foreign University Affiliated' },
              ]}
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Brief description of the course"
              rows={3}
            />

            <Textarea
              label="Criteria"
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              required
              placeholder="Admission criteria and requirements"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Course Level"
                options={[
                  { value: 'PLUS_TWO', label: 'Plus Two' },
                  { value: 'DIPLOMA', label: 'Diploma' },
                  { value: 'BACHELOR', label: 'Bachelor' },
                  { value: 'MASTER', label: 'Master' },
                  { value: 'M_PHIL', label: 'M.Phil' },
                  { value: 'PHD', label: 'PhD' },
                ]}
                value={formData.courseLevel}
                onChange={(e) => setFormData({ ...formData, courseLevel: e.target.value as CourseLevel })}
              />

              <Select
                label="Course Type"
                options={[
                  { value: 'ANNUAL', label: 'Annual' },
                  { value: 'SEMESTER', label: 'Semester' },
                ]}
                value={formData.courseType}
                onChange={(e) => setFormData({ ...formData, courseType: e.target.value as CourseType })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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
                {submitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </FormModal>

        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Course"
          message={`Are you sure you want to delete "${selectedCourse?.courseName}"? This will also delete all associated question sets and questions. This action cannot be undone.`}
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
