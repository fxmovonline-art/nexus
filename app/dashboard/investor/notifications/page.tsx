'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import NotificationItem from '@/components/notifications/NotificationItem';

interface Notification {
  id: string;
  avatar: string;
  userName: string;
  action: string;
  timeAgo: string;
  isNew: boolean;
  type: 'message' | 'connection' | 'investment' | 'update';
}

const investorNotifications: Notification[] = [
  {
    id: '1',
    avatar: '👩‍💼',
    userName: 'Sarah Johnson',
    action: 'sent you a pitch for TechWave AI',
    timeAgo: '5 minutes ago',
    isNew: true,
    type: 'message',
  },
  {
    id: '2',
    avatar: '👨‍💼',
    userName: 'David Chen',
    action: 'accepted your investment connection request',
    timeAgo: '2 hours ago',
    isNew: true,
    type: 'connection',
  },
  {
    id: '3',
    avatar: '👩‍💼',
    userName: 'Maya Patel',
    action: 'updated their startup profile with new funding metrics',
    timeAgo: '1 day ago',
    isNew: false,
    type: 'update',
  },
  {
    id: '4',
    avatar: '👨‍💼',
    userName: 'Alex Thompson',
    action: 'scheduled a founder meeting for Series A round',
    timeAgo: '2 days ago',
    isNew: false,
    type: 'investment',
  },
  {
    id: '5',
    avatar: '👩‍💼',
    userName: 'Lisa Wong',
    action: 'shared due diligence documents for review',
    timeAgo: '3 days ago',
    isNew: false,
    type: 'update',
  },
];

export default function InvestorNotificationsPage() {
  const [notifications, setNotifications] = useState(investorNotifications);
  const unreadCount = notifications.filter((n) => n.isNew).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isNew: false }))
    );
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with your network activity</p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                {...notification}
              />
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 text-lg">No notifications yet</p>
          </div>
        )}
      </div>

      {/* Unread Badge (for reference) */}
      {unreadCount > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            You have <span className="font-semibold">{unreadCount}</span> unread notification
            {unreadCount > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
