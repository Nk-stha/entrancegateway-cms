// ─── Shared Pagination ───────────────────────────────────────────
export interface PaginatedQueryParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    isLast: boolean;
}

// ─── Category ────────────────────────────────────────────────────
export interface CategoryApiResponse {
    categoryId: number;
    categoryName: string;
    remarks: string;
}

export interface Category {
    id: number;
    categoryName: string;
    remarks: string;
}

export interface CategoryFormData {
    categoryName: string;
    remarks: string;
}

// ─── Course ──────────────────────────────────────────────────────
export type CourseLevel = 'PLUS_TWO' | 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'M_PHIL' | 'PHD';
export type CourseType = 'ANNUAL' | 'SEMESTER';

export interface CourseApiResponse {
    courseId: number;
    courseName: string;
    affiliation: string;
    description: string;
    criteria: string;
    courseLevel: CourseLevel;
    courseType: CourseType;
}

export interface Course {
    id: number;
    courseName: string;
    affiliation: string;
    description: string;
    criteria: string;
    courseLevel: CourseLevel;
    courseType: CourseType;
}

export interface CourseFormData {
    courseName: string;
    affiliation: string;
    description: string;
    criteria: string;
    courseLevel: CourseLevel;
    courseType: CourseType;
}

// ─── Entrance Type ───────────────────────────────────────────────
export interface EntranceTypeApiResponse {
    entranceTypeId: number;
    entranceName: string;
    description: string;
    hasNegativeMarking: boolean;
    negativeMarkingValue: number;
}

export interface EntranceType {
    id: number;
    entranceName: string;
    description: string;
    hasNegativeMarking: boolean;
    negativeMarkingValue: number;
}

export interface EntranceTypeFormData {
    entranceName: string;
    description: string;
    hasNegativeMarking: boolean;
    negativeMarkingValue: number;
}

// ─── Question Set ────────────────────────────────────────────────
export interface QuestionSetApiResponse {
    questionSetId: number;
    slug?: string;
    setName: string;
    nosOfQuestions: number;
    durationInMinutes: number;
    description?: string;
    price: number;
    courseId?: number | null;
    courseName?: string | null;
    entranceTypeId?: number | null;
    entranceTypeName?: string | null;
}

export interface QuestionSet {
    id: number;
    setName: string;
    nosOfQuestions: number;
    duration: string | null;
    description: string;
    price: number;
    course: {
        id: number;
        courseName: string;
    } | null;
    entranceType: {
        id: number;
        entranceName: string;
    } | null;
}

export interface QuestionSetFormData {
    setName: string;
    nosOfQuestions: number;
    durationInMinutes: number;
    description: string;
    price: number;
    courseId: number | null;
    entranceTypeId: number | null;
}

// ─── Question & Options ─────────────────────────────────────────
export interface OptionApiResponse {
    optionId: number;
    optionText: string;
    optionImageUrl: string | null;
    optionOrder: number;
    correct: boolean;
}

export interface Option {
    id: number;
    optionText: string;
    optionImageName: string | null;
    optionOrder: number;
    correct: boolean;
}

export interface OptionFormData {
    optionText: string;
    optionOrder: number;
    correct: boolean;
}

export interface QuestionApiResponse {
    questionId: number;
    question: string;
    marks: number;
    categoryId: number;
    categoryName: string;
    questionSetId: number;
    questionSetTitle: string;
    mcqImage: string | null;
    options: OptionApiResponse[];
}

export interface Question {
    id: number;
    question: string;
    marks: number;
    questionImageName: string | null;
    category: {
        id: number;
        categoryName: string;
    };
    options: Option[];
}

export interface QuestionFormData {
    question: string;
    marks: number;
    categoryId: number | null;
    questionSetId: number;
    options: OptionFormData[];
}

// ─── Quiz Attempt ────────────────────────────────────────────────
export interface QuizAttemptApiResponse {
    attemptId: number;
    user: {
        userId: number;
        fullname: string;
    };
    questionSet: {
        setId: number;
        setName: string;
    };
    mcqQuestion: {
        questionId: number;
        question: string;
    };
    selectedOptionId: number;
    isCorrect: boolean;
}

// ─── Dashboard / Analytics ───────────────────────────────────────
export interface CourseStatsResponse {
    totalQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    activeUsers: number;
}

export interface QuizStatsResponse {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    highestScore: number;
    questionAnalysis?: {
        questionId: number;
        questionNumber: number;
        correctPercentage: number;
        difficulty: string;
    }[];
}

export interface CourseRankingResponse {
    userId: number;
    fullname: string;
    averageScore: number;
    totalAttempts: number;
    percentile: number;
}
