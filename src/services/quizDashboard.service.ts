import { apiClient } from '@/lib/api/apiClient';
import type {
    CourseStatsResponse,
    QuizStatsResponse,
    CourseRankingResponse,
} from '@/types/quiz.types';

class QuizDashboardService {
    async getCourseStats(courseId: number): Promise<CourseStatsResponse | null> {
        try {
            const response = await apiClient.get<CourseStatsResponse>(
                `/dashboard/course/${courseId}/stats`
            );
            if (!response || !response.data) return null;
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch course ${courseId} stats:`, error);
            return null;
        }
    }

    async getCourseRankings(courseId: number, limit = 10): Promise<CourseRankingResponse[]> {
        try {
            const response = await apiClient.get<CourseRankingResponse[]>(
                `/dashboard/course/${courseId}/rankings?limit=${limit}`
            );
            if (!response || !response.data) return [];
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch course ${courseId} rankings:`, error);
            return [];
        }
    }

    async getQuizStats(quizId: number): Promise<QuizStatsResponse | null> {
        try {
            const response = await apiClient.get<QuizStatsResponse>(
                `/dashboard/quiz/${quizId}/stats`
            );
            if (!response || !response.data) return null;
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch quiz ${quizId} stats:`, error);
            return null;
        }
    }

    async getQuizRankings(quizId: number, limit = 10): Promise<CourseRankingResponse[]> {
        try {
            const response = await apiClient.get<CourseRankingResponse[]>(
                `/dashboard/quiz/${quizId}/rankings?limit=${limit}`
            );
            if (!response || !response.data) return [];
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch quiz ${quizId} rankings:`, error);
            return [];
        }
    }
}

export const quizDashboardService = new QuizDashboardService();
