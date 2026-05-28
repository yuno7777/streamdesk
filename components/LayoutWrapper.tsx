'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { TicketsProvider } from '@/lib/TicketsContext';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <TicketsProvider>
      <div className="flex min-h-screen bg-[#F1F5F9]">
        {/* Left Fixed Sidebar */}
        <Sidebar />

        {/* Right Content Panel */}
        <div className="flex-1 pl-64 min-h-screen flex flex-col">
          {/* Top Pinned Navigation Bar */}
          <Header />

          {/* Scrollable Content nested underneath */}
          <main className="flex-1 p-8 mt-16 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </TicketsProvider>
  );
}
