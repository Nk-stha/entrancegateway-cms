'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { collegeService } from '@/services/college.service';
import { toast } from '@/lib/utils/toast';
import type { CollegeType, CollegeAffiliation, CollegePriority, College } from '@/types/college.types';

export default function EditCollegePage() {
  const router = useRouter();
  const params = useParams();
  const collegeId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [college, setCollege] = useState<College | null>(null);
  
  const [formData, setFormData] = useState({
    collegeName: '',
    email: '',
    location: '',
    collegeType: 'PRIVATE' as CollegeType,
    affiliation: 'TRIBHUVAN_UNIVERSITY' as CollegeAffiliation,
    priority: 'MEDIUM' as CollegePriority,
    description: '',
    website: '',
    contact: '',
    establishedYear: '',
    latitude: '',
    longitude: '',
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchCollege = async () => {
      setLoading(true);
      const data = await collegeService.getCollegeById(collegeId);
      
      if (data) {
        setCollege(data);
        setFormData({
          collegeName: data.collegeName,
          email: data.email,
          location: data.location,
          collegeType: data.collegeType,
          affiliation: data.affiliation,
          priority: data.priority,
          description: data.description || '',
          website: data.website || '',
          contact: data.contact || '',
          establishedYear: data.establishedYear || '',
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
        });
        
        if (data.logoName) {
          setLogoPreview(`/uploads/logos/${data.logoName}`);
        }
        
        if (data.collegePictureName && data.collegePictureName.length > 0) {
          setExistingImages(data.collegePictureName);
        }
      } else {
        toast.error('College not found');
        router.push('/dashboard/colleges');
      }
      
      setLoading(false);
    };

    fetchCollege();
  }, [collegeId, router]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size must be less than 2MB');
        return;
      }
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(college?.logoName ? `/uploads/logos/${college.logoName}` : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await collegeService.updateCollege(collegeId, {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      logo: logo || undefined,
      images: images.length > 0 ? images : undefined,
    });

    setSubmitting(false);

    if (result.success) {
      router.push('/dashboard/colleges');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="loading" message="Loading college details..." />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!college) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <EmptyState type="empty" message="College not found" />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard/colleges"
                className="inline-flex items-center text-sm text-gray-500 hover:text-brand-blue mb-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Colleges
              </Link>
              <h1
                className="text-2xl md:text-3xl font-bold font-roboto"
                style={{ color: 'var(--color-brand-navy)' }}
              >
                Edit College
              </h1>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-2.5 font-bold rounded-lg shadow-sm transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-brand-gold)', color: 'var(--color-brand-navy)' }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    UPDATING...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    UPDATE COLLEGE
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                  <h2
                    className="text-lg font-bold font-roboto flex items-center gap-2"
                    style={{ color: 'var(--color-brand-navy)' }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: 'var(--color-brand-blue)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Institutional Details
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      College Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.collegeName}
                      onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                      required
                      placeholder="e.g., Advanced Engineering College"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                    />
                  </div>

                  <Select
                    label="Affiliation"
                    options={[
                      { value: 'TRIBHUVAN_UNIVERSITY', label: 'TRIBHUVAN_UNIVERSITY' },
                      { value: 'KATHMANDU_UNIVERSITY', label: 'KATHMANDU_UNIVERSITY' },
                      { value: 'POKHARA_UNIVERSITY', label: 'POKHARA_UNIVERSITY' },
                      { value: 'PURWANCHAL_UNIVERSITY', label: 'PURWANCHAL_UNIVERSITY' },
                      { value: 'LUMBINI_UNIVERSITY', label: 'LUMBINI_UNIVERSITY' },
                      { value: 'FAR_WESTERN_UNIVERSITY', label: 'FAR_WESTERN_UNIVERSITY' },
                      { value: 'MID_WESTERN_UNIVERSITY', label: 'MID_WESTERN_UNIVERSITY' },
                      { value: 'NEB', label: 'NEB' },
                      { value: 'CAMPUS_AFFILIATED_TO_FOREIGN_UNIVERSITY', label: 'FOREIGN_UNIVERSITY' },
                    ]}
                    value={formData.affiliation}
                    onChange={(e) =>
                      setFormData({ ...formData, affiliation: e.target.value as CollegeAffiliation })
                    }
                  />

                  <Select
                    label="College Type"
                    options={[
                      { value: 'PRIVATE', label: 'PRIVATE' },
                      { value: 'COMMUNITY', label: 'COMMUNITY' },
                      { value: 'GOVERNMENT', label: 'PUBLIC/GOVERNMENT' },
                    ]}
                    value={formData.collegeType}
                    onChange={(e) => setFormData({ ...formData, collegeType: e.target.value as CollegeType })}
                  />

                  <Input
                    label="Established Year"
                    type="text"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                    placeholder="e.g., 1990"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                  <h2
                    className="text-lg font-bold font-roboto flex items-center gap-2"
                    style={{ color: 'var(--color-brand-navy)' }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: 'var(--color-brand-blue)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    About Institution
                  </h2>
                </div>
                <div className="p-6">
                  <Textarea
                    label="Bio / Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide a comprehensive overview of the college history, mission, and vision."
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide a comprehensive overview of the college history, mission, and vision.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                  <h2
                    className="text-lg font-bold font-roboto flex items-center gap-2"
                    style={{ color: 'var(--color-brand-navy)' }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: 'var(--color-brand-blue)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Contact & Location
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                        placeholder="contact@college.edu"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                        placeholder="+977-01-xxxxxxx"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
                        placeholder="https://"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Input
                      label="Address / Location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Kathmandu, Bagmati Province"
                    />
                  </div>

                  <Input
                    label="Latitude"
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="27.7172"
                    className="font-mono text-xs"
                  />

                  <Input
                    label="Longitude"
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="85.3240"
                    className="font-mono text-xs"
                  />

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location Preview
                    </label>
                    <LocationPicker
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationChange={(lat: string, lng: string) => {
                        setFormData({ ...formData, latitude: lat, longitude: lng });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                  <h2
                    className="text-lg font-bold font-roboto flex items-center gap-2"
                    style={{ color: 'var(--color-brand-navy)' }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: 'var(--color-brand-blue)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    Settings
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <Select
                      label="Listing Priority"
                      options={[
                        { value: 'HIGH', label: 'HIGH' },
                        { value: 'MEDIUM', label: 'MEDIUM' },
                        { value: 'LOW', label: 'LOW' },
                      ]}
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as CollegePriority })}
                    />
                    <p className="mt-1 text-xs text-gray-500">Determines sort order in listings.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                  <h2
                    className="text-lg font-bold font-roboto flex items-center gap-2"
                    style={{ color: 'var(--color-brand-navy)' }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: 'var(--color-brand-blue)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Branding & Media
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      College Logo {!college.logoName && <span className="text-red-600">*</span>}
                    </label>
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
                        />
                        {logo && (
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {!logo && college.logoName && (
                          <p className="text-xs text-gray-500 mt-2">Current logo. Upload a new file to replace it.</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 hover:border-brand-blue hover:bg-blue-50/30 transition-colors bg-gray-50 cursor-pointer">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer rounded-md font-medium text-brand-blue hover:text-blue-500">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleLogoChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Image Gallery {existingImages.length === 0 && imagePreviews.length === 0 && <span className="text-red-600">*</span>}
                    </label>
                    
                    {existingImages.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Existing images ({existingImages.length})</p>
                        <div className="grid grid-cols-2 gap-3">
                          {existingImages.map((imageName, index) => (
                            <div key={index} className="relative">
                              <img
                                src={`/uploads/colleges/${imageName}`}
                                alt={`Existing ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {imagePreviews.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">New images to add ({imagePreviews.length})</p>
                        <div className="grid grid-cols-2 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`New ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 hover:border-brand-blue hover:bg-blue-50/30 transition-colors bg-gray-50 cursor-pointer">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-brand-blue hover:text-blue-500">
                            <span>Add more photos</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              multiple
                              onChange={handleImagesChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB each. New images will be appended to existing gallery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
