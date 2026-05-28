'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarStats } from '@/lib/TicketsContext';

export default function StatCards() {
  const pathname = usePathname();
  const [stats, setStats] = useState<SidebarStats | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen to custom stats-updated event for real-time updates
    const handleStatsUpdate = () => {
      fetchStats();
    };

    window.addEventListener('stats-updated', handleStatsUpdate);
    return () => {
      window.removeEventListener('stats-updated', handleStatsUpdate);
    };
  }, [pathname]);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 select-none">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-[#E2E8F0] shadow-sm rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Tickets',
      value: stats.total,
      badgeText: 'All logs',
      circleBg: 'bg-slate-50 border-slate-100 text-slate-600',
      trendStyles: 'text-slate-500 bg-slate-50 border-slate-100',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18a2.25 2.25 0 0 1 2.25 2.25v4.5A2.25 2.25 0 0 1 18 21.75H6a2.25 2.25 0 0 1-2.25-2.25v-4.5a2.25 2.25 0 0 1 2.25-2.25ZM6.75 3h10.5a.75.75 0 0 1 .75.75v3.75H6V3.75a.75.75 0 0 1 .75-.75Z" />
        </svg>
      )
    },
    {
      title: 'Open Tickets',
      value: stats.open,
      badgeText: 'Active',
      circleBg: 'bg-blue-50 border-blue-100 text-blue-600',
      trendStyles: 'text-blue-600 bg-blue-50/50 border-blue-100',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
        </svg>
      )
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      badgeText: 'Pending',
      circleBg: 'bg-amber-50 border-amber-100 text-amber-600',
      trendStyles: 'text-amber-600 bg-amber-50/50 border-amber-100',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    },
    {
      title: 'Closed Tickets',
      value: stats.closed,
      badgeText: 'Resolved',
      circleBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      trendStyles: 'text-emerald-600 bg-emerald-50/50 border-emerald-100',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 select-none">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-4.5 flex items-center gap-4 hover:border-[#CBD5E1] transition-all-150"
        >
          {/* Left Circle Icon backdrop */}
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center flex-shrink-0 ${card.circleBg}`}>
            {card.icon}
          </div>

          {/* Right Details Stack */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              {card.title}
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold tracking-tight text-[#0F172A]">
                {card.value}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border leading-none ${card.trendStyles}`}>
                {card.badgeText}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
