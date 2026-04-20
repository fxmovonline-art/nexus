interface StartupDetailHeroProps {
  name: string;
  logo: string;
  bio: string;
  industry: string;
  location: string;
  website?: string;
}

export default function StartupDetailHero({
  name,
  logo,
  bio,
  industry,
  location,
  website,
}: StartupDetailHeroProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
      <div className="flex items-start gap-6 mb-6">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
          {logo}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{name}</h1>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {industry}
            </span>
            <span className="text-gray-600">📍 {location}</span>
          </div>
          <p className="text-gray-600 text-base mb-4">{bio}</p>
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              Visit Website →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
