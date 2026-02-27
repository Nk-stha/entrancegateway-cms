'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormModal } from '@/components/ui/FormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Select } from '@/components/ui/Select';
import { collegeService } from '@/services/college.service';
import { courseService } from '@/services/course.service';
import { toast } from '@/lib/utils/toast';
import type { College, CollegeCourse } from '@/types/college.types';
import type { CourseApiResponse } from '@/types/quiz.types';

export default function CollegeCoursesPage() {
  const router = useRouter();
  const params = useParams();
  const collegeId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [college, setCollege] = useState<College | null>(null);
  const [availableCourses, setAvailableCourses] = useState<CourseApiResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CollegeCourse | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [collegeData, coursesData] = await Promise.all([
        collegeService.getCollegeById(collegeId),
        courseService.getAllCourses(),
      ]);
      
      if (collegeData) {
        setCollege(collegeData);
      } else {
        toast.error('College not found');
        router.push('/dashboard/colleges');
      }
      
      setAvailableCourses(coursesData);
      setLoading(false);
    };

    fetchData();
  }, [collegeId, router]);

  const handleAddCourse = async () => {
    setSelectedCourseId('');
    setShowAddModal(true);
    
    if (availableCourses.length === 0) {
      setLoadingCourses(true);
      const coursesData = await courseService.getAllCourses();
      setAvailableCourses(coursesData);
      setLoadingCourses(false);
    }
  };

  const handleRemoveCourse = (course: CollegeCourse) => {
    setSelectedCourse(course);
    setShowRemoveModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }

    setSubmitting(true);
    const success = await collegeService.addCourseToCollege(collegeId, parseInt(selectedCourseId));

    if (success) {
      setShowAddModal(false);
      const updatedCollege = await collegeService.getCollegeById(collegeId);
      if (updatedCollege) setCollege(updatedCollege);
    }

    setSubmitting(false);
  };

  const handleConfirmRemove = async () => {
    if (!selectedCourse) return;

    setRemoving(true);
    const success = await collegeService.removeCourseFromCollege(collegeId, selectedCourse.courseId);

    if (success) {
      setShowRemoveModal(false);
      const updatedCollege = await collegeService.getCollegeById(collegeId);
      if (updatedCollege) setCollege(updatedCollege);
    }

    setRemoving(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading college courses..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!college) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="empty" message="College not found" />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const courses = college.courses || [];
  
  const courseOptions = availableCourses
    .filter(course => !courses.some(c => c.courseId === course.courseId))
    .map(course => ({
      value: course.courseId.toString(),
      label: `${course.courseName} (${course.courseLevel})`,
    }));

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard/colleges"
                className="inline-flex items-center text-sm text-gray-500 hover:text-brand-blue mb-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Colleges
              </Link>
              <div className="flex items-center gap-3">
                {college.logoName && (
                  <div className="h-12 w-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                    <Image
                      src={college.logoName}
                      alt={college.collegeName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-bold font-roboto"
                    style={{ color: 'var(--color-brand-navy)' }}
                  >
                    {college.collegeName}
                  </h1>
                  <p className="text-sm md:text-base text-gray-500 mt-1">
                    Manage courses offered by this college
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddCourse}
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
              ADD COURSE
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {courses.length === 0 ? (
              <div className="p-12">
                <EmptyState 
                  type="empty" 
                  message="No courses added yet. Click 'Add Course' to get started." 
                />
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                          ID
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Course Name
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Affiliation
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {courses.map((course) => (
                        <tr
                          key={course.courseId}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-400">
                            {course.courseId}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="font-semibold"
                              style={{ color: 'var(--color-brand-navy)' }}
                            >
                              {course.courseName}
                            </div>
                            {course.description && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {course.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-blue-100 text-blue-700 rounded uppercase tracking-tighter">
                              {course.courseLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 text-gray-700 rounded uppercase tracking-tighter">
                              {course.courseType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {course.affiliation}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRemoveCourse(course)}
                              className="p-1.5 text-gray-400 hover:bg-red-50 rounded transition-colors"
                              style={{ color: 'var(--color-error)' }}
                              title="Remove"
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                    </div>
                  ) : (
                    courses.map((course) => (
                    <div
                      key={course.courseId}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3
                          className="font-semibold text-sm flex-1"
                          style={{ color: 'var(--color-brand-navy)' }}
                        >
                          {course.courseName}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded uppercase ml-2 flex-shrink-0">
                          {course.courseLevel}
                        </span>
                      </div>

                      {course.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-700 rounded uppercase">
                          {course.courseType}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate">
                          {course.affiliation}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveCourse(course)}
                        className="w-full px-3 py-1.5 text-xs font-medium rounded transition-colors"
                        style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                      >
                        Remove Course
                      </button>
                    </div>
                  ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <FormModal
          isOpen={showAddModal}
          title="Add Course to College"
          onClose={() => setShowAddModal(false)}
          size="md"
        >
          <form onSubmit={handleSubmitAdd} className="space-y-4">
            {loadingCourses ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
              </div>
            ) : courseOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>All available courses have been added to this college.</p>
              </div>
            ) : (
              <Select
                label="Select Course"
                options={courseOptions}
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              />
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loadingCourses || courseOptions.length === 0}
                className="flex-1 px-4 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50 text-white"
                style={{ backgroundColor: 'var(--color-brand-blue)' }}
              >
                {submitting ? 'Adding...' : 'Add Course'}
              </button>
            </div>
          </form>
        </FormModal>

        <ConfirmModal
          isOpen={showRemoveModal}
          title="Remove Course"
          message={`Are you sure you want to remove "${selectedCourse?.courseName}" from this college?`}
          confirmLabel="Remove"
          loading={removing}
          onConfirm={handleConfirmRemove}
          onCancel={() => setShowRemoveModal(false)}
          variant="danger"
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
