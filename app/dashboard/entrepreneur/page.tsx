'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile?: {
    bio?: string;
    location?: string;
    avatarUrl?: string;
  };
  startup?: {
    id: string;
    name: string;
    industry: string;
    fundingGoal: number;
    amountRaised: number;
    description?: string;
    website?: string;
  };
}

interface InvestmentRecord {
  id: string;
  investorName: string;
  investorEmail: string;
  amount: number;
  date: string;
  status: string;
}

interface Investor {
  id: string;
  name: string;
  title: string;
  investments: number;
  categories: string[];
  interests: string[];
  description: string;
  avatar: string;
  investmentRange: string;
}

const recommendedInvestors: Investor[] = [
  {
    id: '1',
    name: 'Michael Rodriguez',
    title: 'Investor',
    investments: 12,
    categories: ['Seed', 'Series A'],
    interests: ['FinTech', 'SaaS', 'AI/ML'],
    description:
      'Early-stage investor with focus on B2B SaaS and fintech. Previously...',
    avatar: '?????',
    investmentRange: '$250K - $1.5M',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    title: 'Investor',
    investments: 8,
    categories: ['Series A', 'Series B'],
    interests: ['CleanTech', 'HealthTech'],
    description: 'Impact investor focused on sustainable technology solutions...',
    avatar: '?????',
    investmentRange: '$1M - $5M',
  },
];

export default function EntrepreneurDashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [totalFunding, setTotalFunding] = useState(0);
  const [investmentCount, setInvestmentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [investmentsLoading, setInvestmentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken) {
      router.push('/auth/login');
      return;
    }

    // Check user role - only allow entrepreneurs
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.userType !== 'entrepreneur') {
          console.log('[Entrepreneur Dashboard] User is not an entrepreneur, redirecting to investor dashboard');
          router.push('/dashboard/investor');
          return;
        }
      } catch (e) {
        console.error('[Entrepreneur Dashboard] Error parsing user data:', e);
        router.push('/auth/login');
        return;
      }
    }

    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        } else {
          setError('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setError('Connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Fetch investments
  useEffect(() => {
    if (!token || !userProfile?.startup) return;

    const fetchInvestments = async () => {
      try {
        setInvestmentsLoading(true);
        console.log('[Entrepreneur Dashboard] Fetching investments');
        const response = await fetch('/api/investments', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[Entrepreneur Dashboard] Investments fetched:', data);
          setInvestments(data.investments || []);
          setTotalFunding(data.totalFunding || 0);
          setInvestmentCount(data.investmentCount || 0);
        } else {
          console.error('[Entrepreneur Dashboard] Failed to fetch investments');
        }
      } catch (error) {
        console.error('[Entrepreneur Dashboard] Error fetching investments:', error);
      } finally {
        setInvestmentsLoading(false);
      }
    };

    fetchInvestments();
  }, [token, userProfile?.startup?.id]);

  const handleDeleteStartup = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/startup', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUserProfile(prev => prev ? { ...prev, startup: undefined } : null);
        setShowDeleteConfirm(false);
        setError('');
        alert('✅ Startup deleted successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete startup');
      }
    } catch (err) {
      console.error('Error deleting startup:', err);
      setError('Connection error while deleting startup');
    } finally {
      setIsDeleting(false);
    }
  };

  const userName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
    : 'User';

  const startup = userProfile?.startup;
  const fundingProgress = startup
    ? Math.min((startup.amountRaised / startup.fundingGoal) * 100, 100)
    : 0;

  const formattedFundingGoal = startup?.fundingGoal
    ? `$${(startup.fundingGoal / 1000000).toFixed(2)}M`
    : 'Not set';

  const formattedAmountRaised = startup?.amountRaised
    ? `$${(startup.amountRaised / 1000).toFixed(0)}K`
    : '$0';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {!startup && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">Complete Your Profile</h3>
            <p className="text-yellow-800 text-sm mb-4">
              Set up your startup profile to connect with investors and showcase your venture.
            </p>
            <Link
              href="/onboarding/startup-details"
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Register Your Startup
            </Link>
          </div>
        </div>
      )}

      {startup && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700 text-sm">
            ? Your startup profile is complete and visible to investors!
          </p>
        </div>
      )}

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {userName}
          </h1>
          <p className="text-gray-600 text-base">
            {startup
              ? `Here's your ${startup.name} dashboard`
              : "Let's get your startup profile set up"}
          </p>
        </div>
        <div className="flex gap-3">
          {!startup && (
            <Link
              href="/onboarding/startup-details"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2 shadow-md"
            >
              ?? Register Startup
            </Link>
          )}
          <Link
            href="/dashboard/entrepreneur/find-investors"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2 shadow-md"
          >
            ? Find Investors
          </Link>
        </div>
      </div>

      {startup && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            icon="??"
            label="Funding Goal"
            value={formattedFundingGoal}
            color="blue"
          />
          <StatsCard
            icon="??"
            label="Amount Raised"
            value={formattedAmountRaised}
            color="green"
          />
          <StatsCard
            icon="??"
            label="Progress"
            value={`${Math.round(fundingProgress)}%`}
            color="gold"
          />
          <StatsCard
            icon="??"
            label="Industry"
            value={startup.industry}
            color="purple"
          />
          <StatsCard
            icon="??"
            label="Total Funding"
            value={`$${(totalFunding / 1000).toFixed(0)}K`}
            color="green"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {startup && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{startup.name}</h2>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {formattedAmountRaised} / {formattedFundingGoal}
                  </span>
                </div>
                <div className="w-full h-10 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${fundingProgress}%` }}
                  >
                    {fundingProgress > 10 && (
                      <span className="text-white text-xs font-semibold">
                        {Math.round(fundingProgress)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">About</p>
                  <p className="text-gray-900 leading-relaxed">{startup.description}</p>
                </div>

                {startup.website && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Website</p>
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 break-all"
                    >
                      {startup.website}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 flex gap-4">
                  <Link
                    href="/profile/settings"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                  >
                    ?? Edit Startup Details
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm inline-flex items-center gap-1"
                  >
                    ?? Delete Startup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          {!startup ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Getting Started</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">1??</span>
                  <div>
                    <p className="font-medium text-gray-900">Register Startup</p>
                    <p className="text-sm text-gray-600">Add your startup details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">2??</span>
                  <div>
                    <p className="font-medium text-gray-900">Complete Profile</p>
                    <p className="text-sm text-gray-600">Add your bio and skills</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">3??</span>
                  <div>
                    <p className="font-medium text-gray-900">Find Investors</p>
                    <p className="text-sm text-gray-600">Connect with funders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">4??</span>
                  <div>
                    <p className="font-medium text-gray-900">Schedule Meetings</p>
                    <p className="text-sm text-gray-600">Pitch your vision</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recommended Investors</h2>
                <Link
                  href="/explore/investors"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {recommendedInvestors.map((investor) => (
                  <div
                    key={investor.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg">
                          {investor.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{investor.name}</p>
                          <p className="text-xs text-gray-600">
                            {investor.investments} investments
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 font-medium">
                      {investor.categories.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Meetings Section */}
      <div className="mt-8">
        <UpcomingMeetings />
      </div>

      {/* Investments Section */}
      {startup && (
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Investment Activity</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {investmentCount} investment{investmentCount !== 1 ? 's' : ''} received
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {investmentsLoading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading investments...</p>
                </div>
              </div>
            ) : investments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 mb-4">No investments yet</p>
                <Link
                  href="/dashboard/entrepreneur/find-investors"
                  className="inline-block text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Start finding investors →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Investor Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment) => (
                      <tr
                        key={investment.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {investment.investorName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {investment.investorEmail}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          ${investment.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(investment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Total Funding:</p>
                    <p className="text-lg font-bold text-green-600">
                      ${totalFunding.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Startup?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{startup?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStartup}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Startup'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
