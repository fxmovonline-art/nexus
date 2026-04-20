interface SettingCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export default function SettingCard({
  title,
  description,
  children,
  action,
  icon,
}: SettingCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {icon && <div className="text-2xl">{icon}</div>}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
