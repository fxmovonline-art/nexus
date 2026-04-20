'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  name: string;
  initials: string;
  avatar?: string;
}

interface HeaderProps {
  user?: User;
}

export default function Header({ user: defaultUser }: HeaderProps) {
  const [user, setUser] = useState<User>({ name: 'User', initials: 'U' });
  const pathname = usePathname();
  
  useEffect(() => {
    // Get token from localStorage and fetch user data from API
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser({ name: 'User', initials: 'U' });
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          const firstName = userData.firstName || 'User';
          const lastName = userData.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
          const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

          setUser({
            name: fullName,
            initials: initials || 'U',
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);
  
  // Determine if we're on entrepreneur or investor dashboard
  const isEntrepreneur = pathname.includes('/entrepreneur');
  const notificationsLink = isEntrepreneur 
    ? '/dashboard/entrepreneur/notifications' 
    : '/dashboard/investor/notifications';
  const dashboardLink = isEntrepreneur
    ? '/dashboard/entrepreneur'
    : '/dashboard/investor';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-8 py-4 flex items-center justify-between">

        {/* Center: Navigation */}
        <nav className="flex items-center gap-8">
          <Link
            href={dashboardLink}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/dashboard/messages"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
          >
            💭 Messages
          </Link>
          <Link
            href={notificationsLink}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            🔔 Notifications
          </Link>
        </nav>

        {/* Right: Profile Section */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard/profile"
            className="text-gray-600 hover:text-gray-900 font-medium text-sm"
          >
            👤 Profile
          </Link>
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
            🚪 Logout
          </Link>

          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user.initials}
            </div>
            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
