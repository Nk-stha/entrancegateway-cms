import { useState } from 'react';
import type { BlogFormData } from '@/types/blog.types';

export function useBlogForm(initialData?: Partial<BlogFormData>) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    image: null,
    blogStatus: initialData?.blogStatus || 'DRAFT',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    keywords: initialData?.keywords || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BlogFormData, string>>>({});

  const updateField = (field: keyof BlogFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BlogFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      image: null,
      blogStatus: 'DRAFT',
      contactEmail: '',
      contactPhone: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    });
    setErrors({});
  };

  const setFormDataValues = (data: Partial<BlogFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    setFormData: setFormDataValues,
  };
}
