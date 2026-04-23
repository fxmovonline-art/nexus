'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { SidebarProvider } from '@/components/dashboard/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay and Drawer */}
        <MobileSidebarOverlay />
        <MobileSidebarDrawer />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

        {/* Page Content - scrollable */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </SidebarProvider>
  );
}

function MobileSidebarOverlay() {
  const { sidebarOpen, setSidebarOpen } = require('@/components/dashboard/SidebarContext').useSidebar();
  if (!sidebarOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  );
}

function MobileSidebarDrawer() {
  const { sidebarOpen } = require('@/components/dashboard/SidebarContext').useSidebar();
  return (
    <div
      className={`fixed left-0 top-0 h-screen w-64 bg-gray-50 border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <Sidebar />
    </div>
  );
}
