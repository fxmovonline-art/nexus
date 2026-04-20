'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExploreInvestorCard from '@/components/explore/ExploreInvestorCard';

interface Investor {
  id: string;
  name: string;
  bio: string;
  investmentRange: string;
  industries: string[];
  avatar: string;
  location: string;
}

const investorsData: Investor[] = [
  {
    id: '1',
    name: 'Michael Rodriguez',
    bio: 'Early-stage investor with focus on B2B SaaS and fintech startups',
    investmentRange: '$250K - $1.5M',
    industries: ['FinTech', 'SaaS', 'AI/ML'],
    avatar: '👨‍💼',
    location: 'San Francisco, CA',
  },
  {
    id: '2',
    name: 'Jennifer Lee',
    bio: 'Impact investor passionate about sustainable and green technology solutions',
    investmentRange: '$500K - $3M',
    industries: ['CleanTech', 'HealthTech', 'Environment'],
    avatar: '👩‍💼',
    location: 'Portland, OR',
  },
  {
    id: '3',
    name: 'Alex Thompson',
    bio: 'Venture capitalist with expertise in healthcare and biotech innovations',
    investmentRange: '$1M - $5M',
    industries: ['HealthTech', 'Biotech', 'Medical Devices'],
    avatar: '👨‍💼',
    location: 'Boston, MA',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    bio: 'Angel investor focused on early-stage startups and emerging technologies',
    investmentRange: '$100K - $750K',
    industries: ['AI/ML', 'Blockchain', 'SaaS'],
    avatar: '👩‍💼',
    location: 'New York, NY',
  },
  {
    id: '5',
    name: 'David Kim',
    bio: 'Seed-stage investor supporting diverse founders in tech and innovation',
    investmentRange: '$50K - $500K',
    industries: ['StartUp', 'EdTech', 'FinTech'],
    avatar: '👨‍💼',
    location: 'Seattle, WA',
  },
  {
    id: '6',
    name: 'Lisa Chen',
    bio: 'Growth-stage investor with proven track record in scaling tech companies',
    investmentRange: '$2M - $10M',
    industries: ['SaaS', 'E-commerce', 'AI/ML'],
    avatar: '👩‍💼',
    location: 'San Francisco, CA',
  },
];

export default function ExploreInvestorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvestors = investorsData.filter((investor) => {
    return (
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.industries.some((ind) => ind.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Explore Investors</h1>
        <p className="text-gray-600 mt-1">Find potential investors for your startup</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by investor name, location, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Investors Grid */}
      <div>
        {filteredInvestors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestors.map((investor) => (
              <ExploreInvestorCard key={investor.id} {...investor} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">No investors found matching your criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
