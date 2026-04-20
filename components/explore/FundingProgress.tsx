interface FundingProgressProps {
  fundingGoal: string;
  currentFunding: string;
  stage: string;
  targetAmount: number;
  raisedAmount: number;
}

export default function FundingProgress({
  fundingGoal,
  currentFunding,
  stage,
  targetAmount,
  raisedAmount,
}: FundingProgressProps) {
  const percentage = Math.min((raisedAmount / targetAmount) * 100, 100);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Funding Round</h2>
      
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">Funding Stage</p>
        <p className="text-lg font-bold text-blue-600">{stage}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Funding Goal</p>
          <span className="text-sm font-semibold text-gray-600">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Target Amount</p>
          <p className="text-lg font-bold text-gray-900">{fundingGoal}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Raised So Far</p>
          <p className="text-lg font-bold text-blue-600">{currentFunding}</p>
        </div>
      </div>
    </div>
  );
}
