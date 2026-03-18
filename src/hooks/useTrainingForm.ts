import { useState, FormEvent } from 'react';
import type { TrainingFormData, TrainingFormErrors } from '@/types/training.types';
import { toast } from '@/lib/utils/toast';

const initialFormData: TrainingFormData = {
  name: '',
  category: 'data-science',
  certificateProvided: true,
  description: '',
  startDate: '',
  endDate: '',
  type: 'hybrid',
  hours: 0,
  maxParticipants: 0,
  currentParticipants: 0,
  price: 0,
  offerPercentage: 0,
  syllabus: '',
  location: '',
  remarks: '',
  file: null,
  links: [],
};

export function useTrainingForm() {
  const [formData, setFormDataState] = useState<TrainingFormData>(initialFormData);
  const [errors, setErrors] = useState<TrainingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: TrainingFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Training name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.hours <= 0) {
      newErrors.hours = 'Training hours must be greater than 0';
    }

    if (formData.maxParticipants <= 0) {
      newErrors.maxParticipants = 'Max participants must be greater than 0';
    }

    if (formData.currentParticipants < 0) {
      newErrors.currentParticipants = 'Current participants cannot be negative';
    }

    if (formData.currentParticipants > formData.maxParticipants) {
      newErrors.currentParticipants = 'Current participants cannot exceed max participants';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.offerPercentage < 0 || formData.offerPercentage > 100) {
      newErrors.offerPercentage = 'Offer percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = <K extends keyof TrainingFormData>(
    field: K,
    value: TrainingFormData[K]
  ) => {
    setFormDataState(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof TrainingFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
    onSubmit: (data: TrainingFormData) => Promise<void>
  ) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit training:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormDataState(initialFormData);
    setErrors({});
  };

  const setFormData = (data: TrainingFormData) => {
    setFormDataState(data);
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
  };
}
