interface DealRowProps {
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

const statusColors = {
  'Due Diligence': 'bg-blue-100 text-blue-800',
  'Term Sheet': 'bg-green-100 text-green-800',
  'Negotiation': 'bg-yellow-100 text-yellow-800',
  'Closed': 'bg-purple-100 text-purple-800',
  'Passed': 'bg-gray-100 text-gray-800',
};

export default function DealRow({
  avatar,
  startupName,
  industry,
  amount,
  equity,
  status,
  stage,
  lastActivity,
}: DealRowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Startup Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-lg">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{startupName}</p>
            <p className="text-xs text-gray-600">{industry}</p>
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="px-6 py-4">
        <span className="font-semibold text-gray-900 text-sm">{amount}</span>
      </td>

      {/* Equity */}
      <td className="px-6 py-4">
        <span className="font-semibold text-gray-900 text-sm">{equity}</span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
          {status}
        </span>
      </td>

      {/* Stage */}
      <td className="px-6 py-4">
        <span className="text-gray-900 text-sm font-medium">{stage}</span>
      </td>

      {/* Last Activity */}
      <td className="px-6 py-4">
        <span className="text-gray-600 text-sm">{lastActivity}</span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          View Details
        </button>
      </td>
    </tr>
  );
}
