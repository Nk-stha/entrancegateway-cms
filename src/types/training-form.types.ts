export interface TrainingFormData {
  name: string;
  category: string;
  certificateProvided: boolean;
  description: string;
  startDate: string;
  endDate: string;
  type: 'online' | 'onsite' | 'hybrid';
  hours: number;
  maxParticipants: number;
  price: number;
  offerPercentage: number;
  syllabus: string;
  location: string;
  remarks: string;
}

export interface TrainingFormErrors {
  name?: string;
  category?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  hours?: string;
  maxParticipants?: string;
  price?: string;
  offerPercentage?: string;
  syllabus?: string;
  location?: string;
  general?: string;
}
