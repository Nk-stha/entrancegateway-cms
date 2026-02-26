import { useState, useEffect, useCallback } from 'react';
import { questionService } from '@/services/question.service';
import type { Question } from '@/types/quiz.types';

export function useQuestions(questionSetId: number) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await questionService.getQuestionsBySet(questionSetId);
            
            // Transform API response to UI type
            const transformedQuestions: Question[] = result.map(q => ({
                id: q.questionId,
                question: q.question,
                marks: q.marks,
                questionImageName: q.mcqImage,
                category: {
                    id: q.categoryId,
                    categoryName: q.categoryName,
                },
                options: q.options.map(opt => ({
                    id: opt.optionId,
                    optionText: opt.optionText,
                    optionOrder: opt.optionOrder,
                    correct: opt.correct,
                    optionImageName: opt.optionImageUrl,
                })),
            }));
            
            setQuestions(transformedQuestions);
        } catch {
            setError('Unable to load questions. Please try again later.');
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [questionSetId]);

    const refetch = useCallback(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    useEffect(() => {
        if (questionSetId) {
            fetchQuestions();
        }
    }, [questionSetId, fetchQuestions]);

    return { questions, loading, error, refetch };
}
