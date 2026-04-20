'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import DealsTable from '@/components/deals/DealsTable';

interface Deal {
  id: string;
  avatar: string;
  startupName: string;
  industry: string;
  amount: string;
  equity: string;
  status: 'Due Diligence' | 'Term Sheet' | 'Negotiation' | 'Closed' | 'Passed';
  stage: string;
  lastActivity: string;
}

const allDeals: Deal[] = [
  {
    id: '1',
    avatar: '👩‍💼',
    startupName: 'TechWave AI',
    industry: 'FinTech',
    amount: '$1.5M',
    equity: '15%',
    status: 'Due Diligence',
    stage: 'Series A',
    lastActivity: '15/02/2024',
  },
  {
    id: '2',
    avatar: '👨‍💼',
    startupName: 'GreenLife Solutions',
    industry: 'CleanTech',
    amount: '$2M',
    equity: '20%',
    status: 'Term Sheet',
    stage: 'Seed',
    lastActivity: '10/02/2024',
  },
  {
    id: '3',
    avatar: '👩‍💼',
    startupName: 'HealthPulse',
    industry: 'HealthTech',
    amount: '$800K',
    equity: '12%',
    status: 'Negotiation',
    stage: 'Pre-seed',
    lastActivity: '05/02/2024',
  },
  {
    id: '4',
    avatar: '👨‍💼',
    startupName: 'CloudSync Pro',
    industry: 'SaaS',
    amount: '$3M',
    equity: '18%',
    status: 'Closed',
    stage: 'Series B',
    lastActivity: '28/01/2024',
  },
  {
    id: '5',
    avatar: '👩‍💼',
    startupName: 'EcoTrack',
    industry: 'CleanTech',
    amount: '$500K',
    equity: '8%',
    status: 'Passed',
    stage: 'Seed',
    lastActivity: '20/01/2024',
  },
  {
    id: '6',
    avatar: '👨‍💼',
    startupName: 'MediVault',
    industry: 'HealthTech',
    amount: '$1.2M',
    equity: '14%',
    status: 'Term Sheet',
    stage: 'Series A',
    lastActivity: '18/01/2024',
  },
  {
    id: '7',
    avatar: '👩‍💼',
    startupName: 'PayFlow',
    industry: 'FinTech',
    amount: '$2.5M',
    equity: '22%',
    status: 'Due Diligence',
    stage: 'Series A',
    lastActivity: '15/01/2024',
  },
  {
    id: '8',
    avatar: '👨‍💼',
    startupName: 'AgriTech Solutions',
    industry: 'AgTech',
    amount: '$1.8M',
    equity: '16%',
    status: 'Negotiation',
    stage: 'Seed',
    lastActivity: '12/01/2024',
  },
];

const filterOptions = ['All', 'Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'];

export default function InvestorDealsPage() {
  const [activeFilter, setActiveFilter] = useState('Due Diligence');

  const stats = {
    totalInvestment: '$4.3M',
    activeDeals: allDeals.filter((d) => d.status !== 'Closed' && d.status !== 'Passed').length,
    portfolioCompanies: allDeals.filter((d) => d.status === 'Closed').length,
    closedThisMonth: allDeals.filter((d) => d.status === 'Closed').length,
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Deals</h1>
          <p className="text-gray-600 mt-1">Track and manage your investment pipeline</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md">
          Add Deal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon="💵"
          label="Total Investment"
          value={stats.totalInvestment}
          color="blue"
        />
        <StatsCard
          icon="📈"
          label="Active Deals"
          value={stats.activeDeals}
          color="green"
        />
        <StatsCard
          icon="👥"
          label="Portfolio Companies"
          value={stats.portfolioCompanies}
          color="gold"
        />
        <StatsCard
          icon="📅"
          label="Closed This Month"
          value={stats.closedThisMonth}
          color="purple"
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search deals by startup name or industry..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <button className="text-gray-600 hover:text-gray-900 font-semibold py-2 px-4 text-sm">
          🔽 Filter
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-4 flex-wrap pb-4 border-b border-gray-200">
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setActiveFilter(option)}
            className={`text-sm font-medium transition-all ${
              activeFilter === option
                ? 'text-blue-600 border-b-2 border-blue-600 pb-2'
                : 'text-gray-600 hover:text-gray-900 pb-2'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Deals Table */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Active Deals</h2>
        <DealsTable deals={allDeals} activeFilter={activeFilter} />
      </div>
    </DashboardLayout>
  );
}
