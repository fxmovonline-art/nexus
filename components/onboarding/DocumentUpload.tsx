'use client';

import { useState } from 'react';
import { UploadDropzone } from '@uploadthing/react';
import { OurFileRouter } from '@/app/api/uploadthing/core';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function DocumentUpload({ onSuccess, onError }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleUploadComplete = async (res: any) => {
    if (!res || res.length === 0) return;

    const file = res[0];
    const token = localStorage.getItem('token');

    console.log('[DocumentUpload] ✅ File upload completed by UploadThing');
    console.log('[DocumentUpload] File response:', file);
    console.log('[DocumentUpload] File URL:', file.url);
    console.log('[DocumentUpload] File key:', file.key);
    console.log('Upload Success URL:', file.url);

    if (!token) {
      console.error('[DocumentUpload] ❌ No authentication token found in localStorage');
      setUploadStatus('error');
      setStatusMessage('Authentication required');
      if (onError) onError('Authentication required');
      setIsUploading(false);
      return;
    }

    try {
      setIsUploading(true);
      
      // Use the URL from UploadThing directly - it should already be fully formed
      const fileUrl = file.url;
      
      // Fallback: if URL doesn't have protocol, construct it using the key
      let finalUrl = fileUrl;
      if (!finalUrl || !finalUrl.startsWith('http')) {
        console.warn('[DocumentUpload] URL from UploadThing is invalid or missing, using key instead:', file.key);
        finalUrl = `https://utfs.io/f/${file.key}`;
      }
      
      console.log('[DocumentUpload] Final URL to save to database:', finalUrl);
      
      // Save file info to database
      console.log('[DocumentUpload] 📤 Sending request to /api/startup/update-doc');
      const response = await fetch('/api/startup/update-doc', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileUrl: finalUrl,
          fileName: file.name,
        }),
      });
      console.log('[DocumentUpload] API response status:', response.status);
      console.log('[DocumentUpload] API response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      });

      // Try to get response text first to debug
      const responseText = await response.text();
      console.log('[DocumentUpload] Raw response text:', responseText);

      if (response.ok) {
        try {
          // Only parse if there's content
          let data = {};
          if (responseText) {
            data = JSON.parse(responseText);
          }
          console.log('[DocumentUpload] Success response:', data);
          console.log('[DocumentUpload] Saved to database with URL:', (data as any).startup?.pitchDeckUrl);
          setUploadStatus('success');
          setStatusMessage('✓ Pitch deck uploaded successfully!');
          if (onSuccess) {
            onSuccess();
          }
          // Reset after 3 seconds
          setTimeout(() => {
            setUploadStatus('idle');
            setStatusMessage('');
          }, 3000);
        } catch (parseError) {
          console.error('[DocumentUpload] JSON parse error:', parseError);
          console.error('[DocumentUpload] Tried to parse:', responseText);
          setUploadStatus('error');
          setStatusMessage('Server error: Invalid response format');
          if (onError) onError('Server error: Invalid response format');
        }
      } else {
        try {
          // Try to parse error response
          const data = responseText ? JSON.parse(responseText) : { error: 'Unknown error' };
          console.error('[DocumentUpload] API error response:', data);
          setUploadStatus('error');
          setStatusMessage(data.error || `Failed to save document (${response.status})`);
          if (onError) onError(data.error || `Failed to save document (${response.status})`);
        } catch (parseError) {
          console.error('[DocumentUpload] Error parsing error response:', parseError);
          console.error('[DocumentUpload] Raw error response:', responseText);
          setUploadStatus('error');
          setStatusMessage(`Server error (${response.status}): ${responseText || 'No response'}`);
          if (onError) onError(`Server error (${response.status})`);
        }
      }
    } catch (error) {
      console.error('[DocumentUpload] Network error:', error);
      console.error('[DocumentUpload] Error details:', (error as Error).message);
      setUploadStatus('error');
      setStatusMessage('Network connection error');
      if (onError) onError('Network connection error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error('[DocumentUpload] ❌ Upload failed at UploadThing step:', error);
    console.error('[DocumentUpload] Error message:', error.message);
    console.error('[DocumentUpload] Error name:', error.name);
    setUploadStatus('error');
    setStatusMessage(error.message || 'Upload failed');
    if (onError) onError(error.message || 'Upload failed');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Upload Pitch Deck</h3>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Upload a PDF of your pitch deck to share with investors. Maximum file size: 4MB.
        </p>

        <UploadDropzone<OurFileRouter, 'pitchDeckUploader'>
          endpoint="pitchDeckUploader"
          url="/api/uploadthing"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          content={{
            label: '📄 Drop your PDF here or click to upload',
            allowedContent: 'PDF only (max 4MB)',
          }}
          appearance={{
            button:
              'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
            allowedContent: 'text-sm text-gray-500',
            container: 'w-full rounded-lg border-2 border-dashed border-gray-300',
          }}
        />

        {uploadStatus === 'success' && (
          <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
