import { useCallback, useMemo, useState, type FormEvent } from 'react';
import type {
  CreateQuizTemplateRequest,
  QuizTemplateFormData,
  QuizTemplateFormErrors,
  QuizTemplateMutationResponse,
} from '@/types/quiz.types';

const createTopicRow = () => ({
  id: crypto.randomUUID(),
  topicId: crypto.randomUUID(),
  count: '',
  weightage: '',
});

const initialFormData: QuizTemplateFormData = {
  name: '',
  description: '',
  type: 'PRACTICE',
  entryFee: '0.00',
  totalQuestions: '',
  totalMarks: '',
  durationMinutes: '',
  enableNegativeMarking: false,
  negativeMarkValue: '0.25',
  status: 'DRAFT',
  difficultyDistribution: {
    EASY: '30',
    MODERATE: '50',
    DIFFICULT: '20',
  },
  constraints: {
    noRepeatWithinDays: '30',
    avoidPreviouslyFailed: true,
    maxUsageCount: '5',
  },
  topicDistribution: [createTopicRow()],
};

interface SubmitResult {
  success: boolean;
  data?: QuizTemplateMutationResponse;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export function useQuizTemplateForm() {
  const [formData, setFormData] = useState<QuizTemplateFormData>(initialFormData);
  const [errors, setErrors] = useState<QuizTemplateFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const difficultyTotal = useMemo(() => {
    return ['EASY', 'MODERATE', 'DIFFICULT'].reduce((sum, key) => {
      const value = Number(formData.difficultyDistribution[key as keyof typeof formData.difficultyDistribution] || '0');
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }, [formData.difficultyDistribution]);

  const handleChange = <K extends keyof QuizTemplateFormData>(
    field: K,
    value: QuizTemplateFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    const fieldErrorKey = field as keyof QuizTemplateFormErrors;
    if (errors[fieldErrorKey]) {
      setErrors((prev) => ({ ...prev, [fieldErrorKey]: undefined }));
    }
  };

  const handleDifficultyChange = (
    key: keyof QuizTemplateFormData['difficultyDistribution'],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      difficultyDistribution: {
        ...prev.difficultyDistribution,
        [key]: value,
      },
    }));

    if (errors.difficultyDistribution) {
      setErrors((prev) => ({ ...prev, difficultyDistribution: undefined }));
    }
  };

  const handleConstraintChange = (
    key: keyof QuizTemplateFormData['constraints'],
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [key]: value,
      },
    }));

    if (errors.constraints) {
      setErrors((prev) => ({ ...prev, constraints: undefined }));
    }
  };

  const handleTopicChange = (
    rowId: string,
    field: 'topicId' | 'count' | 'weightage',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      topicDistribution: prev.topicDistribution.map((topic) =>
        topic.id === rowId ? { ...topic, [field]: value } : topic
      ),
    }));

    if (errors.topicDistribution) {
      setErrors((prev) => ({ ...prev, topicDistribution: undefined }));
    }
  };

  const addTopicRow = () => {
    setFormData((prev) => ({
      ...prev,
      topicDistribution: [...prev.topicDistribution, createTopicRow()],
    }));
  };

  const removeTopicRow = (rowId: string) => {
    setFormData((prev) => {
      if (prev.topicDistribution.length === 1) {
        return prev;
      }

      return {
        ...prev,
        topicDistribution: prev.topicDistribution.filter((topic) => topic.id !== rowId),
      };
    });
  };

  const regenerateTopicId = (rowId: string) => {
    handleTopicChange(rowId, 'topicId', crypto.randomUUID());
  };

  // Map from backend field key to form error key.
  // Order matters: more specific keys must come before generic ones
  // to prevent e.g. "config.constraints.maxUsageCount" matching "name".
  const fieldKeyMap: Array<{ pattern: string; target: keyof QuizTemplateFormErrors }> = [
    { pattern: 'negativeMarkValue', target: 'negativeMarkValue' },
    { pattern: 'difficultyDistribution', target: 'difficultyDistribution' },
    { pattern: 'topicDistribution', target: 'topicDistribution' },
    { pattern: 'totalQuestions', target: 'totalQuestions' },
    { pattern: 'totalMarks', target: 'totalMarks' },
    { pattern: 'durationMinutes', target: 'durationMinutes' },
    { pattern: 'constraints', target: 'constraints' },
    { pattern: 'entryFee', target: 'entryFee' },
    { pattern: 'description', target: 'description' },
    { pattern: 'status', target: 'status' },
    { pattern: 'type', target: 'type' },
    { pattern: 'name', target: 'name' },
  ];

  const mapFieldErrors = (fieldErrors?: Record<string, string>) => {
    if (!fieldErrors) {
      return;
    }

    const mappedErrors: QuizTemplateFormErrors = {};

    for (const [key, value] of Object.entries(fieldErrors)) {
      // Match the first pattern that appears as a dot-delimited segment or exact match
      const match = fieldKeyMap.find(({ pattern }) => {
        // Exact match or the key ends with `.pattern` (e.g. "config.name" → "name")
        return key === pattern || key.endsWith(`.${pattern}`);
      });

      if (match) {
        mappedErrors[match.target] = value;
      } else {
        mappedErrors.general = value;
      }
    }

    setErrors((prev) => ({ ...prev, ...mappedErrors }));
  };

  const buildPayload = (): CreateQuizTemplateRequest => {
    const normalizedDescription = formData.description.trim();
    const normalizedDifficulty = {
      EASY: Number(formData.difficultyDistribution.EASY || '0'),
      MODERATE: Number(formData.difficultyDistribution.MODERATE || '0'),
      DIFFICULT: Number(formData.difficultyDistribution.DIFFICULT || '0'),
    };

    return {
      name: formData.name.trim(),
      description: normalizedDescription || undefined,
      type: formData.type,
      entryFee: Number(formData.entryFee),
      status: formData.status,
      config: {
        totalQuestions: Number(formData.totalQuestions),
        totalMarks: Number(formData.totalMarks),
        durationMinutes: Number(formData.durationMinutes),
        topicDistribution: formData.topicDistribution.map((topic) => ({
          topicId: topic.topicId.trim(),
          count: Number(topic.count),
          weightage: Number(topic.weightage),
        })),
        difficultyDistribution: normalizedDifficulty,
        enableNegativeMarking: formData.enableNegativeMarking,
        negativeMarkValue: formData.enableNegativeMarking
          ? Number(formData.negativeMarkValue || '0')
          : 0,
        constraints: {
          noRepeatWithinDays: formData.constraints.noRepeatWithinDays
            ? Number(formData.constraints.noRepeatWithinDays)
            : undefined,
          avoidPreviouslyFailed: formData.constraints.avoidPreviouslyFailed,
          maxUsageCount: formData.constraints.maxUsageCount
            ? Number(formData.constraints.maxUsageCount)
            : undefined,
        },
      },
    };
  };

  const validateForm = (): boolean => {
    const nextErrors: QuizTemplateFormErrors = {};

    const name = formData.name.trim();
    if (!name) {
      nextErrors.name = 'Template name is required';
    } else if (name.length < 3 || name.length > 200) {
      nextErrors.name = 'Template name must be between 3 and 200 characters';
    }

    if (formData.description.trim().length > 1000) {
      nextErrors.description = 'Description cannot exceed 1000 characters';
    }

    const entryFee = Number(formData.entryFee);
    if (!Number.isFinite(entryFee)) {
      nextErrors.entryFee = 'Entry fee must be a valid number';
    } else if (entryFee < 0 || entryFee > 99999.99) {
      nextErrors.entryFee = 'Entry fee must be between 0.00 and 99999.99';
    }

    const totalQuestions = Number(formData.totalQuestions);
    if (!Number.isInteger(totalQuestions) || totalQuestions <= 0) {
      nextErrors.totalQuestions = 'Total questions must be greater than 0';
    }

    const totalMarks = Number(formData.totalMarks);
    if (!Number.isInteger(totalMarks) || totalMarks <= 0) {
      nextErrors.totalMarks = 'Total marks must be greater than 0';
    }

    const durationMinutes = Number(formData.durationMinutes);
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      nextErrors.durationMinutes = 'Duration must be greater than 0 minutes';
    }

    if (formData.enableNegativeMarking) {
      const negativeMarkValue = Number(formData.negativeMarkValue);
      if (!Number.isFinite(negativeMarkValue) || negativeMarkValue < 0) {
        nextErrors.negativeMarkValue = 'Negative mark value must be 0 or higher';
      }
    }

    const topicDistribution = formData.topicDistribution;
    if (topicDistribution.length === 0) {
      nextErrors.topicDistribution = 'At least one topic distribution row is required';
    } else {
      const totalTopicCount = topicDistribution.reduce((sum, topic) => sum + Number(topic.count || '0'), 0);
      const totalWeightage = topicDistribution.reduce((sum, topic) => sum + Number(topic.weightage || '0'), 0);

      const hasInvalidTopic = topicDistribution.some((topic) => {
        const count = Number(topic.count);
        const weightage = Number(topic.weightage);

        return (
          !topic.topicId.trim() ||
          !Number.isInteger(count) ||
          count <= 0 ||
          !Number.isInteger(weightage) ||
          weightage <= 0
        );
      });

      if (hasInvalidTopic) {
        nextErrors.topicDistribution = 'Each topic must have a UUID, question count, and weightage greater than 0';
      } else if (Number.isInteger(totalQuestions) && totalQuestions > 0 && totalTopicCount !== totalQuestions) {
        nextErrors.topicDistribution = 'Topic question counts must equal total questions';
      } else if (totalWeightage !== 100) {
        nextErrors.topicDistribution = 'Topic weightage total must equal 100%';
      }
    }

    if (difficultyTotal !== 100) {
      nextErrors.difficultyDistribution = 'Difficulty distribution must total 100%';
    }

    const constraintMessages: string[] = [];

    const noRepeatWithinDays = formData.constraints.noRepeatWithinDays;
    if (noRepeatWithinDays && (!Number.isInteger(Number(noRepeatWithinDays)) || Number(noRepeatWithinDays) < 0)) {
      constraintMessages.push('No repeat within days must be 0 or higher');
    }

    const maxUsageCount = formData.constraints.maxUsageCount;
    if (maxUsageCount && (!Number.isInteger(Number(maxUsageCount)) || Number(maxUsageCount) <= 0)) {
      constraintMessages.push('Max usage count must be greater than 0');
    }

    if (constraintMessages.length > 0) {
      nextErrors.constraints = constraintMessages.join('. ');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    onSubmit: (payload: CreateQuizTemplateRequest) => Promise<SubmitResult>
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return { success: false, error: 'Please correct the highlighted form errors.' };
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      const result = await onSubmit(payload);

      if (!result.success) {
        mapFieldErrors(result.fieldErrors);
        if (result.error && !result.fieldErrors) {
          setErrors((prev) => ({ ...prev, general: result.error }));
        }
      }

      return result;
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : 'An unexpected error occurred. Please try again.';
      setErrors((prev) => ({ ...prev, general: message }));
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const populateFromResponse = useCallback((data: QuizTemplateMutationResponse) => {
    const config = data.config;

    setFormData({
      name: data.name,
      description: data.description || '',
      type: data.type,
      entryFee: String(data.entryFee),
      totalQuestions: String(config.totalQuestions),
      totalMarks: String(config.totalMarks),
      durationMinutes: String(config.durationMinutes),
      enableNegativeMarking: config.enableNegativeMarking ?? false,
      negativeMarkValue: String(config.negativeMarkValue ?? 0),
      status: data.status,
      difficultyDistribution: {
        EASY: String(config.difficultyDistribution?.EASY ?? 0),
        MODERATE: String(config.difficultyDistribution?.MODERATE ?? 0),
        DIFFICULT: String(config.difficultyDistribution?.DIFFICULT ?? 0),
      },
      constraints: {
        noRepeatWithinDays: String(config.constraints?.noRepeatWithinDays ?? ''),
        avoidPreviouslyFailed: config.constraints?.avoidPreviouslyFailed ?? false,
        maxUsageCount: String(config.constraints?.maxUsageCount ?? ''),
      },
      topicDistribution: config.topicDistribution.map((topic) => ({
        id: crypto.randomUUID(),
        topicId: topic.topicId,
        count: String(topic.count),
        weightage: String(topic.weightage),
      })),
    });

    setErrors({});
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return {
    formData,
    errors,
    isSubmitting,
    difficultyTotal,
    handleChange,
    handleDifficultyChange,
    handleConstraintChange,
    handleTopicChange,
    addTopicRow,
    removeTopicRow,
    regenerateTopicId,
    handleSubmit,
    populateFromResponse,
    resetForm,
  };
}
