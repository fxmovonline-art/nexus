import Link from 'next/link';

interface ExploreStartupCardProps {
  id: string;
  name: string;
  bio: string;
  industry: string;
  logo: string;
  founderName: string;
  location: string;
  onRequestMeeting?: (startup: ExploreStartupCardProps) => void;
}

export default function ExploreStartupCard({
  id,
  name,
  bio,
  industry,
  logo,
  founderName,
  location,
  onRequestMeeting,
}: ExploreStartupCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Logo */}
      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-2xl mb-4">
        {logo}
      </div>

      {/* Startup Name */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{name}</h3>

      {/* Founder */}
      <p className="text-sm text-gray-600 mb-3">by {founderName}</p>

      {/* Industry Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {industry}
        </span>
      </div>

      {/* Location */}
      <p className="text-xs text-gray-500 mb-4">{location}</p>

      {/* Bio */}
      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{bio}</p>

      {/* Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/explore/startups/${id}`}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm text-center"
        >
          View Details
        </Link>
        <button
          onClick={() => onRequestMeeting?.({ id, name, bio, industry, logo, founderName, location })}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          📅 Request Meeting
        </button>
      </div>
    </div>
  );
}
