'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SidebarStats } from '@/lib/TicketsContext';

export default function StatusDonut() {
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
      console.error('Error fetching donut statistics:', err);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen to custom stats-updated event for updates
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
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 h-[280px] animate-pulse"></div>
    );
  }

  const { open, inProgress, closed } = stats;
  const total = open + inProgress + closed;

  // Format data for Recharts Pie
  const chartData = total === 0 ? [] : [
    { name: 'Open', value: open, color: '#2563EB', bg: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' },
    { name: 'In Progress', value: inProgress, color: '#D97706', bg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]' },
    { name: 'Closed', value: closed, color: '#16A34A', bg: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]' }
  ].filter(d => d.value > 0);

  const pctOpen = total > 0 ? Math.round((open / total) * 100) : 0;
  const pctInProgress = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const pctClosed = total > 0 ? Math.round((closed / total) * 100) : 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 h-[280px] flex flex-col justify-between hover:border-[#CBD5E1] transition-all-150 select-none w-full">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-3 flex justify-between items-center flex-shrink-0">
        <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">
          Status Distribution
        </h3>
        <span className="text-[11px] font-semibold text-[#64748B]">Ratio</span>
      </div>

      {/* Chart Panel */}
      <div className="flex-1 flex items-center justify-between gap-4 py-2 min-h-0">
        {/* Recharts Pie (Donut) */}
        <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
          {total === 0 ? (
            // Empty state placeholder ring
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1F5F9" strokeWidth="5" />
            </svg>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="72%"
                  outerRadius="100%"
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={600}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Centered Total Label */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-[#0F172A] leading-none">{total}</span>
            <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">Tickets</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 text-xs font-semibold max-w-[125px]">
          <div className="flex items-center justify-between px-2 py-1 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0"></span>
              <span className="truncate">Open</span>
            </div>
            <span>{pctOpen}%</span>
          </div>
          <div className="flex items-center justify-between px-2 py-1 rounded bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0"></span>
              <span className="truncate">Pending</span>
            </div>
            <span>{pctInProgress}%</span>
          </div>
          <div className="flex items-center justify-between px-2 py-1 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] flex-shrink-0"></span>
              <span className="truncate">Closed</span>
            </div>
            <span>{pctClosed}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
