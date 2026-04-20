'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RequestMeetingModal from '@/components/meetings/RequestMeetingModal';

interface StartupDetail {
  id: string;
  name: string;
  description: string;
  industry: string;
  fundingGoal: number;
  amountRaised: number;
  website?: string;
  logo?: string;
  location?: string;
  teamSize?: number;
  pitchDeckUrl?: string;
  pitchDeckName?: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      avatarUrl?: string;
      bio?: string;
      location?: string;
      website?: string;
      phone?: string;
    };
  };
  team?: Array<{
    id: string;
    name: string;
    role: string;
    email?: string;
  }>;
}

export default function StartupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const startupId = params.id as string;

  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // URL validation helper
  const isValidUrl = (urlString: string): boolean => {
    if (!urlString) return false;
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Function to ensure URL is absolute (UploadThing format)
  const ensureAbsoluteUrl = (url: string): string | null => {
    if (!url) return null;
    
    // If it's using the old mock URL format, return null (URL doesn't work)
    if (url.includes('nexus-uploads')) {
      console.log('[Startup Detail] Found legacy mock URL (not accessible):', url);
      return null;
    }
    
    // Already a valid UploadThing URL
    if (url.startsWith('https://utfs.io/f/')) {
      return url;
    }
    
    // If it's another https/http URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's just a key, prefix with UploadThing CDN
    if (url.startsWith('/') || !url.includes('.')) {
      console.log('[Startup Detail] Attempting to convert key to URL:', url);
      return `https://utfs.io/f/${url}`;
    }
    
    return url;
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserId(userData.id);
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        console.log('[Startup Detail] Fetching startup:', startupId);
        const response = await fetch(`/api/startup/${startupId}`);

        console.log('[Startup Detail] Response status:', response.status);
        const data = await response.json();
        console.log('[Startup Detail] Response data:', data);
        
        if (data.startup?.pitchDeckUrl) {
          console.log('[Startup Detail] Fetching URL for Investor:', data.startup.pitchDeckUrl);
          console.log('[Startup Detail] PDF Name:', data.startup.pitchDeckName);
        }

        if (response.ok) {
          console.log('[Startup Detail] Fetched startup:', data.startup.name);
          setStartup(data.startup);
        } else {
          console.error('[Startup Detail] API Error:', data.error);
          setError(data.error || 'Startup not found');
        }
      } catch (err) {
        console.error('[Startup Detail] Error:', err);
        setError('Failed to load startup details');
      } finally {
        setIsLoading(false);
      }
    };

    if (startupId) {
      fetchStartup();
    }
  }, [startupId]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInvest = async () => {
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to invest');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(investmentAmount),
          startupId: startupId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err instanceof Error ? err.message : 'Failed to process investment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading startup details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !startup) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fundingProgress = (startup.amountRaised / startup.fundingGoal) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 flex items-center gap-2"
          >
            ← Back to Startups
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                {/* Logo */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-4xl mb-4">
                  {startup.logo || '🚀'}
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{startup.name}</h1>

                {/* Industry Badge */}
                <div className="flex gap-2 items-center mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    {startup.industry}
                  </span>
                  {startup.location && (
                    <span className="text-gray-600 text-sm">📍 {startup.location}</span>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  📅 Request Meeting
                </button>
                <button
                  onClick={() => setIsInvestModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  💰 Invest Now
                </button>
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors text-center"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{startup.description}</p>
              {startup.teamSize && (
                <p className="text-gray-600">
                  <span className="font-semibold">Team Size:</span> {startup.teamSize} people
                </p>
              )}
            </div>

            {/* Pitch Deck Section */}
            {(() => {
              const pdfUrl = startup.pitchDeckUrl ? ensureAbsoluteUrl(startup.pitchDeckUrl) : null;
              const isValidPdf = pdfUrl && isValidUrl(pdfUrl);

              if (!pdfUrl || !isValidPdf) {
                const hasLegacyUrl = startup.pitchDeckUrl?.includes('nexus-uploads');
                
                return (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Pitch Deck</h2>
                    <div className="flex items-start gap-3 py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-lg mt-1">📄</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">No pitch deck available</p>
                        {hasLegacyUrl && (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: The previous pitch deck format is no longer supported. The entrepreneur needs to re-upload it.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Pitch Deck</h2>
                  <div className="flex flex-col gap-3">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                      onClick={() => {
                        console.log('[Startup Detail] Opening PDF:', pdfUrl);
                      }}
                    >
                      📄 {startup.pitchDeckName || 'Download Pitch Deck'}
                    </a>
                    <p className="text-xs text-gray-500">
                      {startup.pitchDeckName && `File: ${startup.pitchDeckName}`}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Team Section */}
            {startup.team && startup.team.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Members</h2>
                <div className="space-y-4">
                  {startup.team.map((member) => (
                    <div key={member.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-blue-600 mb-1">{member.role}</p>
                      {member.email && (
                        <p className="text-sm text-gray-600 break-all">{member.email}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Funding Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Funding</h3>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ${(startup.amountRaised / 1000000).toFixed(2)}M / ${(startup.fundingGoal / 1000000).toFixed(2)}M
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Goal</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${(startup.fundingGoal / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Raised</p>
                  <p className="text-xl font-bold text-green-600">
                    ${(startup.amountRaised / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>
            </div>

            {/* Founder Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Founder</h3>

              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-2xl mb-4">
                {startup.owner.profile?.avatarUrl ? (
                  <img
                    src={startup.owner.profile.avatarUrl}
                    alt={`${startup.owner.firstName} ${startup.owner.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>

              <h4 className="font-bold text-gray-900 mb-1">
                {startup.owner.firstName} {startup.owner.lastName}
              </h4>
              <p className="text-sm text-gray-600 mb-4 break-all">{startup.owner.email}</p>

              {startup.owner.profile?.bio && (
                <p className="text-sm text-gray-600 mb-3">{startup.owner.profile.bio}</p>
              )}

              {startup.owner.profile?.location && (
                <p className="text-sm text-gray-600 mb-2">
                  📍 {startup.owner.profile.location}
                </p>
              )}

              {startup.owner.profile?.website && (
                <a
                  href={startup.owner.profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  🌐 {startup.owner.profile.website}
                </a>
              )}
            </div>

            {/* Contact Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Interested?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Request a meeting with the founder to discuss investment opportunities.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                📅 Request Meeting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Meeting Modal */}
      {startup && (
        <RequestMeetingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          startup={{
            id: startup.id,
            name: startup.name,
            founderName: `${startup.owner.firstName} ${startup.owner.lastName}`,
            logo: startup.logo || '🚀',
          }}
          investorId={userId}
          entrepreneurId={startup.owner.id}
        />
      )}

      {/* Investment Modal */}
      {isInvestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invest in {startup?.name}</h2>
            <p className="text-gray-600 mb-6">Enter the investment amount (USD)</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black bg-white"
                  disabled={isProcessing}
                />
                {investmentAmount && parseFloat(investmentAmount) < 1 && (
                  <p className="text-red-600 text-sm mt-2">Amount must be at least $1</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsInvestModalOpen(false);
                    setInvestmentAmount('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvest}
                  disabled={isProcessing || !investmentAmount || parseFloat(investmentAmount) < 1}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
