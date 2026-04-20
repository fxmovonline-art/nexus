'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DocumentUpload from '@/components/onboarding/DocumentUpload';
import { FileText, Download, Trash2, AlertCircle } from 'lucide-react';

interface Startup {
  id: string;
  name: string;
  pitchDeckUrl?: string;
  pitchDeckName?: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchStartup = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.startup) {
            setStartup(data.user.startup);
          }
        } else {
          setError('Failed to fetch startup details');
        }
      } catch (error) {
        console.error('Failed to fetch startup:', error);
        setError('Connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartup();
  }, [token]);

  const handleDeleteDocument = async () => {
    if (!startup || !window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch('/api/startup/update-doc', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileUrl: null,
          fileName: null,
        }),
      });

      if (response.ok) {
        setStartup({ ...startup, pitchDeckUrl: undefined, pitchDeckName: undefined });
      } else {
        setError('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Connection error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadSuccess = () => {
    // Refresh startup data
    if (token) {
      fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.startup) {
            setStartup(data.user.startup);
          }
        })
        .catch(console.error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents & Pitch Deck</h1>
          <p className="text-gray-600">Manage your startup's pitch deck and documents</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Documents Section */}
        <div className="space-y-6">
          {startup?.pitchDeckUrl ? (
            <>
              {/* Uploaded Document Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {startup.pitchDeckName || 'Pitch Deck'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Uploaded on {formatDate(startup.updatedAt)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
                        <span>Document</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Preview Button */}
                    <a
                      href={startup.pitchDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Preview
                    </a>

                    {/* Delete Button */}
                    <button
                      onClick={handleDeleteDocument}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Document Info */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Document Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">File Name</p>
                      <p className="text-sm font-medium text-gray-900">{startup.pitchDeckName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Upload Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(startup.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Replace Document Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Replace Document</h2>
                <DocumentUpload onSuccess={handleUploadSuccess} />
              </div>
            </>
          ) : (
            <>
              {/* Empty State */}
              <div className="bg-white rounded-xl border border-gray-200 p-16 shadow-sm text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Documents Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Upload your pitch deck to share with potential investors. Make a great first impression!
                </p>
              </div>

              {/* Upload Component */}
              <div>
                <DocumentUpload onSuccess={handleUploadSuccess} />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
