'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  fundingGoal: number;
  website?: string;
  pitchDeckUrl?: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const industries = ['All', 'FinTech', 'CleanTech', 'HealthTech', 'SaaS', 'AI/ML', 'EdTech', 'Blockchain', 'E-Commerce', 'Other'];

export default function ExplorStartupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        console.log('[Explore Startups] Fetching startups...');
        let url = '/api/startup';
        const params = new URLSearchParams();
        
        if (selectedIndustry !== 'All') {
          params.append('industry', selectedIndustry);
        }
        
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        if (params.toString()) {
          url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[Explore Startups] Fetched', data.startups.length, 'startups');
          setStartups(data.startups);
        } else {
          console.error('[Explore Startups] Failed to fetch:', response.status);
          setError('Failed to load startups');
        }
      } catch (err) {
        console.error('[Explore Startups] Error:', err);
        setError('Connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartups();
  }, [selectedIndustry, searchQuery]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading startups...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Startups</h1>
        <p className="text-gray-600 mt-1">Discover promising startups and investment opportunities</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by startup name, description, or founder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Filter by:</span>
        {industries.map((industry) => (
          <button
            key={industry}
            onClick={() => setSelectedIndustry(industry)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedIndustry === industry
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {industry}
          </button>
        ))}
      </div>

      {/* Startups Grid */}
      <div>
        {startups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <div
                key={startup.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{startup.name}</h3>
                      <p className="text-sm text-gray-600">
                        {startup.owner?.firstName} {startup.owner?.lastName}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-blue-600 mb-3">{startup.industry}</p>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{startup.description}</p>

                <div className="mb-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Funding Goal</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(startup.fundingGoal / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>

                <Link
                  href={`/explore/startups/${startup.id}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm text-center"
                >
                  View Full Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">No startups found matching your criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
