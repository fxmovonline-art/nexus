'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const getMenuItems = (isEntrepreneur: boolean) => [
  { icon: '🏠', label: 'Dashboard', href: isEntrepreneur ? '/dashboard/entrepreneur' : '/dashboard/investor' },
  { icon: '🏦', label: 'My Portfolio', href: '/dashboard/portfolio' },
  { icon: '🔍', label: isEntrepreneur ? 'Find Investors' : 'Find Startups', href: isEntrepreneur ? '/dashboard/entrepreneur/find-investors' : '/explore/startups' },
  { icon: '💭', label: 'Messages', href: '/dashboard/messages' },
  { icon: '🔔', label: 'Notifications', href: isEntrepreneur ? '/dashboard/entrepreneur/notifications' : '/dashboard/investor/notifications' },
  { icon: '📊', label: 'Deals', href: isEntrepreneur ? '/dashboard/entrepreneur/deals' : '/dashboard/investor/deals' },
];

const settingItems = [
  { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
  { icon: '❓', label: 'Help & Support', href: '/dashboard/help' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isEntrepreneur = pathname.includes('/entrepreneur');
  const menuItems = getMenuItems(isEntrepreneur);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-gray-50 h-screen sticky top-0 flex flex-col border-r border-gray-200">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            📦
          </div>
          <span className="font-bold text-base text-gray-900">Business Nexus</span>
        </Link>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-3 py-6 space-y-0">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
              isActive(item.href)
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-white hover:text-gray-900'
            } ${isActive(item.href) ? 'border-l-4 border-blue-600' : ''}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Settings Section */}
      <div className="px-3 py-6 border-t border-gray-200 bg-gray-50">
        <p className="text-xs font-bold text-gray-500 uppercase px-4 mb-4 tracking-wide">Settings</p>
        <div className="space-y-0">
          {settingItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="px-4 py-6 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 font-medium mb-2">Need assistance?</p>
        <p className="text-sm font-bold text-gray-900 mb-2">Contact Support</p>
        <a
          href="mailto:support@businessnexus.com"
          className="text-xs text-blue-600 hover:text-blue-700 break-all font-medium"
        >
          support@businessnexus.com
        </a>
      </div>
    </aside>
  );
}
