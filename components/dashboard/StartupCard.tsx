interface StartupCardProps {
  id: string;
  founderName: string;
  founderTitle: string;
  companyName: string;
  industry: string;
  location: string;
  foundedYear: string;
  pitchSummary: string;
  founderAvatar: string;
  isOnline?: boolean;
}

export default function StartupCard({
  founderName,
  founderTitle,
  companyName,
  industry,
  location,
  foundedYear,
  pitchSummary,
  founderAvatar,
  isOnline = true,
}: StartupCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 hover:shadow-lg transition-shadow">
      {/* Founder Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full flex items-center justify-center text-2xl">
            {founderAvatar}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{founderName}</h3>
          <p className="text-sm text-gray-600">{founderTitle}</p>
        </div>
      </div>

      {/* Company Info */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-900">{companyName}</span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {industry}
        </span>
      </div>

      {/* Location and Founded */}
      <div className="text-xs text-gray-600 mb-3">
        <p>{location}</p>
        <p className="bg-yellow-100 text-yellow-800 inline-block px-2 py-1 rounded mt-2 font-medium">
          {foundedYear}
        </p>
      </div>

      {/* Pitch Summary */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-900 mb-2">Pitch Summary</h4>
        <p className="text-sm text-gray-600">{pitchSummary}</p>
      </div>

      {/* Action Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded text-sm transition-colors">
        View Details
      </button>
    </div>
  );
}
