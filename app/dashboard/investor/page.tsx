'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import UpcomingMeetings from '@/components/dashboard/UpcomingMeetings';

interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  fundingGoal: number;
  amountRaised: number;
  website?: string;
  pitchDeckUrl?: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const industries = ['FinTech', 'CleanTech', 'HealthTech', 'AgTech', 'SaaS', 'AI/ML', 'EdTech', 'Blockchain', 'E-Commerce'];

export default function InvestorDashboardPage() {
  const router = useRouter();
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('User');
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState('');
  const [startups, setStartups] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken) {
      router.push('/auth/login');
      return;
    }

    // Check user role - only allow investors
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.userType !== 'investor') {
          console.log('[Investor Dashboard] User is not an investor, redirecting to entrepreneur dashboard');
          router.push('/dashboard/entrepreneur');
          return;
        }
      } catch (e) {
        console.error('[Investor Dashboard] Error parsing user data:', e);
        router.push('/auth/login');
        return;
      }
    }

    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;

    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          const fullName = `${user.firstName} ${user.lastName}`.trim();
          setUserName(fullName);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    // Fetch all startups
    const fetchStartups = async () => {
      try {
        console.log('[Investor Dashboard] Fetching startups...');
        const response = await fetch('/api/startup');
        
        if (response.ok) {
          const data = await response.json();
          console.log('[Investor Dashboard] Fetched', data.startups.length, 'startups');
          setStartups(data.startups);
        } else {
          console.error('[Investor Dashboard] Failed to fetch startups:', response.status);
          setError('Failed to load startups');
        }
      } catch (error) {
        console.error('[Investor Dashboard] Error fetching startups:', error);
        setError('Connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    fetchStartups();
  }, [token]);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const filteredStartups = startups.filter((startup) => {
    const matchesSearch =
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.owner?.firstName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry =
      selectedIndustries.length === 0 || selectedIndustries.includes(startup.industry);

    return matchesSearch && matchesIndustry;
  });

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {userName}</h1>
        <p className="text-gray-600 text-base">Discover and connect with promising startups</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading startups...</p>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Discover Startups</h2>
            <p className="text-gray-600 mt-1">Find and connect with promising entrepreneurs</p>
          </div>
          <Link
            href="/explore/startups"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md inline-block"
          >
            📺 View All Startups
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mt-6 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search startups, industries, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon="👥"
            label="Total Startups"
            value="4"
            color="blue"
          />
          <StatsCard
            icon="🔄"
            label="Industries"
            value="4"
            color="green"
          />
          <StatsCard
            icon="🎯"
            label="Active Opportunities"
            value="12"
            color="gold"
          />
        </div>

        {/* Industry Filter */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Filter by Industry</p>
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => toggleIndustry(industry)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedIndustries.includes(industry)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Startups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.length > 0 ? (
            filteredStartups.map((startup) => (
              <div
                key={startup.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{startup.name}</h3>
                  <p className="text-sm text-gray-600">
                    {startup.owner?.firstName} {startup.owner?.lastName}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {startup.industry}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{startup.description}</p>

                <div className="mb-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Funding Goal:</span>
                    <span className="font-semibold text-gray-900">
                      ${(startup.fundingGoal / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                  Learn More
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-semibold text-gray-900 mb-2">No startups found</p>
              <p className="text-gray-600 text-sm">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Meetings Section */}
      <div className="mt-8">
        <UpcomingMeetings />
      </div>
        </>
      )}
    </DashboardLayout>
  );
}
