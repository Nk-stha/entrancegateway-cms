'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { useCourses } from '@/hooks/useCourses';
import { useQuestionSets } from '@/hooks/useQuestionSets';
import { quizDashboardService } from '@/services/quizDashboard.service';
import type {
  CourseStatsResponse,
  QuizStatsResponse,
  CourseRankingResponse,
} from '@/types/quiz.types';

export default function AnalyticsPage() {
  const { courses, loading: coursesLoading } = useCourses({ page: 0, size: 100 });
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const { questionSets, loading: quizSetsLoading, refetch: refetchQuizSets } = useQuestionSets({
    page: 0,
    size: 100,
  });

  const [courseStats, setCourseStats] = useState<CourseStatsResponse | null>(null);
  const [courseRankings, setCourseRankings] = useState<CourseRankingResponse[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStatsResponse | null>(null);
  const [quizRankings, setQuizRankings] = useState<CourseRankingResponse[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseStats(selectedCourseId);
      refetchQuizSets();
    } else {
      setCourseStats(null);
      setCourseRankings([]);
      setSelectedQuizId(null);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedQuizId) {
      fetchQuizStats(selectedQuizId);
    } else {
      setQuizStats(null);
      setQuizRankings([]);
    }
  }, [selectedQuizId]);

  const fetchCourseStats = async (courseId: number) => {
    setLoadingStats(true);
    const [stats, rankings] = await Promise.all([
      quizDashboardService.getCourseStats(courseId),
      quizDashboardService.getCourseRankings(courseId, 10),
    ]);
    setCourseStats(stats);
    setCourseRankings(rankings);
    setLoadingStats(false);
  };

  const fetchQuizStats = async (quizId: number) => {
    setLoadingStats(true);
    const [stats, rankings] = await Promise.all([
      quizDashboardService.getQuizStats(quizId),
      quizDashboardService.getQuizRankings(quizId, 10),
    ]);
    setQuizStats(stats);
    setQuizRankings(rankings);
    setLoadingStats(false);
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return null;
  };

  const renderRankBadge = (rank: number) => {
    const color = getMedalColor(rank);
    if (!color) {
      return <span className="text-sm font-medium text-gray-900">{rank}</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: color }}
        >
          {rank}
        </div>
      </div>
    );
  };

  if (coursesLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading analytics..." />
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
              Quiz Analytics
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              View course and quiz performance statistics
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Select Course"
                value={selectedCourseId?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCourseId(value ? parseInt(value) : null);
                  setSelectedQuizId(null);
                }}
                options={[
                  { value: '', label: 'Select a course...' },
                  ...courses.map((course) => ({
                    value: course.id.toString(),
                    label: course.courseName,
                  })),
                ]}
              />

              <Select
                label="Select Quiz Set"
                value={selectedQuizId?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedQuizId(value ? parseInt(value) : null);
                }}
                options={[
                  { value: '', label: selectedCourseId ? 'Select a quiz set...' : 'Select course first' },
                  ...questionSets
                    .filter(set => !selectedCourseId || set.course?.id === selectedCourseId)
                    .map((set) => ({
                      value: set.id.toString(),
                      label: set.setName,
                    })),
                ]}
                disabled={!selectedCourseId || quizSetsLoading}
              />
            </div>
          </div>

          {loadingStats && (
            <EmptyState type="loading" message="Loading statistics..." />
          )}

          {!loadingStats && selectedCourseId && courseStats && (
            <div>
              <h2
                className="text-xl font-bold font-roboto mb-4"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Course Statistics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Quizzes"
                  value={courseStats.totalQuizzes}
                  icon="quiz"
                />
                <StatCard
                  title="Total Attempts"
                  value={courseStats.totalAttempts}
                  icon="assignment_turned_in"
                />
                <StatCard
                  title="Average Score"
                  value={`${courseStats.averageScore.toFixed(1)}%`}
                  icon="trending_up"
                />
                <StatCard
                  title="Active Users"
                  value={courseStats.activeUsers}
                  icon="people"
                />
              </div>
            </div>
          )}

          {!loadingStats && selectedQuizId && quizStats && (
            <div>
              <h2
                className="text-xl font-bold font-roboto mb-4"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Quiz Statistics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Attempts"
                  value={quizStats.totalAttempts}
                  icon="assignment_turned_in"
                />
                <StatCard
                  title="Average Score"
                  value={`${quizStats.averageScore.toFixed(1)}%`}
                  icon="trending_up"
                />
                <StatCard
                  title="Pass Rate"
                  value={`${quizStats.passRate.toFixed(1)}%`}
                  icon="check_circle"
                />
                <StatCard
                  title="Highest Score"
                  value={`${quizStats.highestScore.toFixed(1)}%`}
                  icon="star"
                />
              </div>
            </div>
          )}

          {!loadingStats && selectedCourseId && courseRankings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2
                  className="text-xl font-bold font-roboto"
                  style={{ color: 'var(--color-brand-navy)' }}
                >
                  Course Rankings
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attempts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentile
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courseRankings.map((ranking, index) => {
                      const rank = index + 1;
                      return (
                        <tr key={ranking.userId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderRankBadge(rank)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ranking.fullname}</p>
                              <p className="text-xs text-gray-500">ID: {ranking.userId}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-brand-blue)' }}>
                              {ranking.averageScore.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {ranking.totalAttempts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {ranking.percentile.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="block md:hidden divide-y divide-gray-200">
                {courseRankings.map((ranking, index) => {
                  const rank = index + 1;
                  return (
                    <div key={ranking.userId} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {renderRankBadge(rank)}
                          <div>
                            <p className="font-semibold text-gray-900">{ranking.fullname}</p>
                            <p className="text-xs text-gray-500">Rank #{rank}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold" style={{ color: 'var(--color-brand-blue)' }}>
                          {ranking.averageScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Attempts</p>
                          <p className="font-medium text-gray-900">{ranking.totalAttempts}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Percentile</p>
                          <p className="font-medium text-gray-900">{ranking.percentile.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loadingStats && selectedQuizId && quizRankings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2
                  className="text-xl font-bold font-roboto"
                  style={{ color: 'var(--color-brand-navy)' }}
                >
                  Quiz Rankings
                </h2>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attempts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentile
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quizRankings.map((ranking, index) => {
                      const rank = index + 1;
                      return (
                        <tr key={ranking.userId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderRankBadge(rank)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ranking.fullname}</p>
                              <p className="text-xs text-gray-500">ID: {ranking.userId}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-brand-blue)' }}>
                              {ranking.averageScore.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {ranking.totalAttempts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {ranking.percentile.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="block md:hidden divide-y divide-gray-200">
                {quizRankings.map((ranking, index) => {
                  const rank = index + 1;
                  return (
                    <div key={ranking.userId} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {renderRankBadge(rank)}
                          <div>
                            <p className="font-semibold text-gray-900">{ranking.fullname}</p>
                            <p className="text-xs text-gray-500">Rank #{rank}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold" style={{ color: 'var(--color-brand-blue)' }}>
                          {ranking.averageScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Attempts</p>
                          <p className="font-medium text-gray-900">{ranking.totalAttempts}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Percentile</p>
                          <p className="font-medium text-gray-900">{ranking.percentile.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loadingStats && !selectedCourseId && (
            <EmptyState
              type="empty"
              message="Select a course to view analytics"
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
