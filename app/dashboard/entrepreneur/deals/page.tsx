'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function EntrepreneurDealsPage() {
  return (
    <DashboardLayout>
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Investment Deals</h1>
        <p className="text-gray-600">Track your funding rounds and investor commitments</p>
        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
          ➕ Start Fundraising
        </button>
      </div>
    </DashboardLayout>
  );
}
