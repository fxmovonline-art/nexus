'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle, Loader, FileText } from 'lucide-react';
import { UploadDropzone } from '@uploadthing/react';
import { OurFileRouter } from '@/app/api/uploadthing/core';

interface StartupFormData {
  name: string;
  industry: string;
  fundingGoal: string;
  description: string;
  website?: string;
  pitchDeckUrl?: string;
  pitchDeckName?: string;
}

const industries = [
  'AI/ML',
  'FinTech',
  'CleanTech',
  'HealthTech',
  'SaaS',
  'E-Commerce',
  'EdTech',
  'Blockchain',
  'Other',
];

export default function StartupDetailsPage() {
  const router = useRouter();
  const [pitchDeckUrl, setPitchDeckUrl] = useState<string | null>(null);
  const [pitchDeckName, setPitchDeckName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    setError,
  } = useForm<StartupFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      industry: '',
      fundingGoal: '',
      description: '',
      website: '',
    },
  });

  const description = watch('description');
  const TOKEN_KEY = 'token';

  // Handle successful upload from UploadDropzone
  const handleUploadComplete = (res: any) => {
    console.log('[Upload] ✅ Upload complete - Response:', res);
    
    if (!res || res.length === 0) {
      console.error('[Upload] ❌ No response data');
      setUploadError('Upload response is empty');
      return;
    }

    const uploadedFile = res[0];
    console.log('[Upload] File data:', uploadedFile);

    const fileUrl = uploadedFile.url;
    const fileName = uploadedFile.name || 'Pitch Deck';

    if (!fileUrl) {
      console.error('[Upload] ❌ No URL in response');
      setUploadError('No URL returned from upload service');
      return;
    }

    console.log('[Upload] ✅ Setting state - URL:', fileUrl, 'Name:', fileName);
    setPitchDeckUrl(fileUrl);
    setPitchDeckName(fileName);
    setIsUploaded(true);
    setUploadError(null);
    setIsUploading(false);

    alert(`✅ File uploaded successfully!\n\nFilename: ${fileName}`);
  };

  // Handle upload errors
  const handleUploadError = (error: Error) => {
    console.error('[Upload] ❌ Upload error:', error);
    const errorMsg = error.message || 'Upload failed';
    setUploadError(errorMsg);
    setPitchDeckUrl(null);
    setPitchDeckName(null);
    setIsUploaded(false);
    setIsUploading(false);
    alert(`❌ Upload failed:\n\n${errorMsg}`);
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push('/auth/login');
    }
    console.log('[StartupForm] Component mounted. Ready to upload.');
  }, [router]);

  useEffect(() => {
    console.log('[StartupForm] Upload state changed - isUploaded:', isUploaded, 'URL:', pitchDeckUrl, 'Name:', pitchDeckName);
  }, [isUploaded, pitchDeckUrl, pitchDeckName]);

  const onSubmit = async (data: StartupFormData) => {
    try {
      // Validate document upload using isUploaded flag
      if (!isUploaded || !pitchDeckUrl || !pitchDeckName) {
        console.error('[StartupForm] Upload validation failed:', { isUploaded, pitchDeckUrl, pitchDeckName });
        setError('root', { message: 'Please upload a pitch deck before registering.' });
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setError('root', { message: 'Session expired. Please login again.' });
        router.push('/auth/login');
        return;
      }

      console.log('[StartupForm] Starting registration with upload:', { pitchDeckUrl, pitchDeckName, isUploaded });

      const response = await fetch('/api/startup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name.trim(),
          industry: data.industry,
          fundingGoal: parseFloat(data.fundingGoal),
          description: data.description.trim(),
          website: data.website?.trim() || '',
          pitchDeckUrl,
          pitchDeckName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[StartupForm] API error:', result);
        const errorMsg = result.details ? `${result.error}: ${result.details}` : result.error || 'Failed to register startup';
        setError('root', {
          message: errorMsg,
        });
        return;
      }

      // Success - show success state and redirect
      setTimeout(() => {
        router.push('/dashboard/entrepreneur');
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setError('root', {
        message: 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-md">
              🚀
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Register Your Startup
          </h1>
          <p className="text-gray-600">
            Complete your startup profile to connect with investors
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-red-700 text-sm">{errors.root.message}</p>
                </div>
              </div>
            )}

            {/* Startup Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Startup Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g., TechWave AI"
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-black ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('name', {
                  required: 'Startup name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Name must be less than 100 characters',
                  },
                })}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Industry Dropdown */}
            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Industry / Category *
              </label>
              <select
                id="industry"
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-black ${
                  errors.industry ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('industry', {
                  required: 'Please select an industry',
                })}
              >
                <option value="">Select an industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="text-red-600 text-sm mt-1">{errors.industry.message}</p>
              )}
            </div>

            {/* Funding Goal */}
            <div>
              <label
                htmlFor="fundingGoal"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Funding Goal (USD) *
              </label>
              <input
                id="fundingGoal"
                type="number"
                placeholder="e.g., 500000"
                min="1"
                step="1"
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-black ${
                  errors.fundingGoal ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('fundingGoal', {
                  required: 'Funding goal is required',
                  validate: (value) => {
                    const num = parseFloat(value);
                    if (isNaN(num)) return 'Must be a valid number';
                    if (num <= 0) return 'Must be greater than 0';
                    return true;
                  },
                })}
              />
              {errors.fundingGoal && (
                <p className="text-red-600 text-sm mt-1">{errors.fundingGoal.message}</p>
              )}
            </div>

            {/* Website (Optional) */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                id="website"
                type="url"
                placeholder="e.g., https://techwaveai.com"
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-black ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('website', {
                  validate: (value) => {
                    if (!value) return true;
                    if (!/^https?:\/\/.+\..+/.test(value)) {
                      return 'Please enter a valid URL (e.g., https://example.com)';
                    }
                    return true;
                  },
                })}
              />
              {errors.website && (
                <p className="text-red-600 text-sm mt-1">{errors.website.message}</p>
              )}
            </div>

            {/* Description / Pitch */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pitch / Description *
                <span className="text-gray-500 font-normal text-xs ml-2">
                  ({description.length}/500)
                </span>
              </label>
              <textarea
                id="description"
                placeholder="Tell us about your startup, your mission, and what problem you're solving..."
                rows={5}
                maxLength={500}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none text-black ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 50,
                    message: 'Description must be at least 50 characters',
                  },
                  maxLength: {
                    value: 500,
                    message: 'Description must not exceed 500 characters',
                  },
                })}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Minimum 50 characters, maximum 500 characters
              </p>
            </div>

            {/* Pitch Deck Upload Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">
                  Pitch Deck (PDF) *
                </label>
              </div>
              
              {pitchDeckUrl && pitchDeckName ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-green-900">✅ PDF Uploaded</p>
                    <p className="text-green-700 text-sm truncate">{pitchDeckName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('[Replace Button] Clearing upload state');
                      setPitchDeckUrl(null);
                      setPitchDeckName(null);
                      setUploadError(null);
                      setIsUploaded(false);
                    }}
                    className="text-green-600 hover:text-green-700 font-medium text-sm whitespace-nowrap"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <>
                  <UploadDropzone<OurFileRouter, 'pitchDeckUploader'>
                    endpoint="pitchDeckUploader"
                    url="/api/uploadthing"
                    onClientUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                    onUploadBegin={() => setIsUploading(true)}
                    content={{
                      label: '📄 Drop your PDF here or click to upload',
                      allowedContent: 'PDF only (max 4MB)',
                    }}
                    appearance={{
                      button:
                        'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
                      allowedContent: 'text-sm text-gray-500',
                      container: 'w-full rounded-lg border-2 border-dashed border-blue-300',
                    }}
                  />

                  {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-red-700 text-sm font-medium">Upload Error</p>
                        <p className="text-red-600 text-sm">{uploadError}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !isUploaded}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting || isUploading || !isUploaded
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : isUploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : !isUploaded ? (
                  '👉 Upload Pitch Deck First'
                ) : (
                  '✨ Register Startup'
                )}
              </button>

              {/* Skip Link */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Want to skip for now?{' '}
                  <Link
                    href="/dashboard/entrepreneur"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Continue to Dashboard
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> You can update your startup information anytime from your
            profile settings after registration.
          </p>
        </div>
      </div>
    </div>
  );
}
