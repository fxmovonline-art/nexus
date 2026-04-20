interface ExploreInvestorCardProps {
  id: string;
  name: string;
  bio: string;
  investmentRange: string;
  industries: string[];
  avatar: string;
  location: string;
}

export default function ExploreInvestorCard({
  id,
  name,
  bio,
  investmentRange,
  industries,
  avatar,
  location,
}: ExploreInvestorCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
      {/* Avatar */}
      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
        {avatar}
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{name}</h3>

      {/* Location */}
      <p className="text-sm text-gray-600 text-center mb-3">{location}</p>

      {/* Investment Range */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4 text-center">
        <p className="text-xs text-gray-600 mb-1">Investment Range</p>
        <p className="text-sm font-bold text-blue-600">{investmentRange}</p>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4 text-center">{bio}</p>

      {/* Industries */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Interested In</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {industries.map((industry) => (
            <span
              key={industry}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"
            >
              {industry}
            </span>
          ))}
        </div>
      </div>

      {/* Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
        Connect
      </button>
    </div>
  );
}
