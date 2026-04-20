interface StartupAboutProps {
  description: string;
  problemStatement: string;
  solution: string;
  targetMarket: string;
}

export default function StartupAbout({
  description,
  problemStatement,
  solution,
  targetMarket,
}: StartupAboutProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">About</h2>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Company Overview</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>

        {/* Problem */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Problem Statement</h3>
          <p className="text-gray-600 leading-relaxed">{problemStatement}</p>
        </div>

        {/* Solution */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Our Solution</h3>
          <p className="text-gray-600 leading-relaxed">{solution}</p>
        </div>

        {/* Target Market */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Target Market</h3>
          <p className="text-gray-600 leading-relaxed">{targetMarket}</p>
        </div>
      </div>
    </div>
  );
}
