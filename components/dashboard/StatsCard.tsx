interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'gold' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  gold: 'bg-yellow-100',
  purple: 'bg-purple-100',
};

export default function StatsCard({
  icon,
  label,
  value,
  color = 'blue',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>

        {/* Right: Label and Value */}
        <div className="flex-1 text-right">
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
