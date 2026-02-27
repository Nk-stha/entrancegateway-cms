export type CollegeType = 'PRIVATE' | 'COMMUNITY' | 'GOVERNMENT';

export type CollegePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type CollegeAffiliation =
  | 'TRIBHUVAN_UNIVERSITY'
  | 'KATHMANDU_UNIVERSITY'
  | 'POKHARA_UNIVERSITY'
  | 'PURWANCHAL_UNIVERSITY'
  | 'LUMBINI_UNIVERSITY'
  | 'FAR_WESTERN_UNIVERSITY'
  | 'MID_WESTERN_UNIVERSITY'
  | 'NEB'
  | 'CAMPUS_AFFILIATED_TO_FOREIGN_UNIVERSITY';

export interface CollegeCourse {
  courseId: number;
  courseName: string;
  description: string;
  courseLevel: string;
  courseType: string;
  affiliation: string;
  criteria: string;
  collegeResponses: null;
}

export interface College {
  collegeId: number;
  collegeName: string;
  location: string;
  affiliation: CollegeAffiliation;
  website?: string;
  contact?: string;
  email: string;
  description?: string;
  establishedYear?: string;
  collegeType: CollegeType;
  priority: CollegePriority;
  logoName?: string;
  latitude?: number;
  longitude?: number;
  collegePictureName?: string[];
  courses?: CollegeCourse[];
}

export interface CollegeFormData {
  collegeName: string;
  email: string;
  location: string;
  collegeType: CollegeType;
  affiliation: CollegeAffiliation;
  priority: CollegePriority;
  description?: string;
  website?: string;
  contact?: string;
  establishedYear?: string;
  latitude?: number;
  longitude?: number;
  logo?: File;
  images?: File[];
}

export interface CollegeCreateRequest {
  collegeName: string;
  email: string;
  location: string;
  collegeType: CollegeType;
  affiliation: CollegeAffiliation;
  priority: CollegePriority;
  description?: string;
  website?: string;
  contact?: string;
  establishedYear?: string;
  latitude?: number;
  longitude?: number;
}

export interface CollegeQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CollegeApiResponse {
  collegeId: number;
  collegeName: string;
  location: string;
  affiliation: CollegeAffiliation;
  website?: string;
  contact?: string;
  email: string;
  description?: string;
  establishedYear?: string;
  collegeType: CollegeType;
  priority: CollegePriority;
  logoName?: string;
  latitude?: number;
  longitude?: number;
  collegePictureName?: string[];
  courses?: CollegeCourse[];
}
