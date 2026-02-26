import { apiClient } from '@/lib/api/apiClient';
import type {
    QuestionApiResponse,
    QuestionFormData,
} from '@/types/quiz.types';
import type { ApiError } from '@/types/api.types';

class QuestionService {
    private readonly endpoint = '/questions';

    async getQuestionsBySet(questionSetId: number): Promise<QuestionApiResponse[]> {
        try {
            const response = await apiClient.get<Record<string, QuestionApiResponse[]>>(
                `${this.endpoint}/set/${questionSetId}`
            );

            if (!response || !response.data) {
                return [];
            }

            // Flatten the grouped response into a single array
            const allQuestions: QuestionApiResponse[] = [];
            Object.values(response.data).forEach(categoryQuestions => {
                allQuestions.push(...categoryQuestions);
            });

            return allQuestions;
        } catch {
            return [];
        }
    }

    async createQuestion(
        questionData: QuestionFormData,
        imageFile: File | null,
        optionImageFiles: (File | null)[]
    ): Promise<{
        success: boolean;
        data?: QuestionApiResponse;
        error?: string;
    }> {
        try {
            const formData = new FormData();

            formData.append('question', questionData.question);
            formData.append('marks', questionData.marks.toString());
            
            if (!questionData.categoryId) {
                return { success: false, error: 'Category is required' };
            }
            formData.append('categoryId', questionData.categoryId.toString());
            formData.append('questionSetId', questionData.questionSetId.toString());

            // Find the correct answer index
            const correctAnswerIndex = questionData.options.findIndex(opt => opt.correct);
            if (correctAnswerIndex === -1) {
                return { success: false, error: 'At least one correct answer is required' };
            }
            formData.append('correctAnswerIndex', correctAnswerIndex.toString());

            // Question image file
            if (imageFile) {
                formData.append('imageFile', imageFile);
            }

            // Append each option as individual form fields
            questionData.options.forEach((option, index) => {
                formData.append(`options[${index}].optionText`, option.optionText);
                formData.append(`options[${index}].optionOrder`, option.optionOrder.toString());
                formData.append(`options[${index}].correct`, option.correct.toString());
            });

            // Append option image files as array
            optionImageFiles.forEach((file) => {
                if (file) {
                    formData.append('optionImageFiles', file);
                }
            });

            // Log FormData contents for debugging
            console.log('Creating question with data:');
            console.log('- question:', questionData.question);
            console.log('- marks:', questionData.marks);
            console.log('- categoryId:', questionData.categoryId);
            console.log('- questionSetId:', questionData.questionSetId);
            console.log('- correctAnswerIndex:', correctAnswerIndex);
            console.log('- imageFile:', imageFile ? imageFile.name : 'none');
            console.log('- options:', questionData.options);
            console.log('- optionImageFiles:', optionImageFiles.filter(f => f !== null).map(f => f?.name));

            const response = await apiClient.postMultipart<QuestionApiResponse>(
                this.endpoint,
                formData
            );

            if (!response || !response.data) {
                return { success: false, error: 'Failed to create question' };
            }

            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Failed to create question:', apiError);
            console.error('Error details:', {
                message: apiError.message,
                errors: apiError.errors,
                status: apiError.status,
            });

            let errorMessage = 'Failed to create question';
            if (apiError.message) {
                errorMessage = apiError.message;
            }
            if (apiError.errors) {
                const errorDetails = Object.entries(apiError.errors)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                errorMessage = `${errorMessage} - ${errorDetails}`;
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    async updateQuestion(id: number, data: QuestionFormData): Promise<{
        success: boolean;
        data?: QuestionApiResponse;
        error?: string;
    }> {
        try {
            const response = await apiClient.put<QuestionApiResponse>(`${this.endpoint}/${id}`, data);

            if (!response || !response.data) {
                return { success: false, error: 'Failed to update question' };
            }

            return { success: true, data: response.data };
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to update question ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to update question',
            };
        }
    }

    async deleteQuestion(id: number): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            await apiClient.delete(`${this.endpoint}/${id}`);
            return { success: true };
        } catch (error) {
            const apiError = error as ApiError;
            console.error(`Failed to delete question ${id}:`, apiError);

            return {
                success: false,
                error: apiError.message || 'Failed to delete question',
            };
        }
    }
}

export const questionService = new QuestionService();
