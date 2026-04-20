'use client';

import DealRow from '@/components/deals/DealRow';

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

interface DealsTableProps {
  deals: Deal[];
  activeFilter: string;
}

export default function DealsTable({ deals, activeFilter }: DealsTableProps) {
  const filteredDeals = deals.filter((deal) => activeFilter === 'All' || deal.status === activeFilter);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Startup
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Equity
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Stage
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Last Activity
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredDeals.length > 0 ? (
            filteredDeals.map((deal) => (
              <DealRow key={deal.id} {...deal} />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <p className="text-gray-600">No deals found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
