interface NotificationItemProps {
  id: string;
  avatar: string;
  userName: string;
  action: string;
  timeAgo: string;
  isNew?: boolean;
  type: 'message' | 'connection' | 'investment' | 'update';
}

const typeIcons = {
  message: '💬',
  connection: '🤝',
  investment: '💰',
  update: '📢',
};

export default function NotificationItem({
  avatar,
  userName,
  action,
  timeAgo,
  isNew = false,
  type,
}: NotificationItemProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer flex items-start gap-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-xl">
          {avatar}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">{userName}</h3>
          {isNew && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              New
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-2">{action}</p>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <span>{typeIcons[type]}</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
