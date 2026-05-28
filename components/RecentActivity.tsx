'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ticket } from './TicketTable';

export default function RecentActivity() {
  const pathname = usePathname();
  const [activities, setActivities] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        // Slice the first 3 most recent activities to match the compact sidebar grid
        setActivities(data.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Listen to custom stats-updated event for sync
    const handleStatsUpdate = () => {
      fetchActivities();
    };

    window.addEventListener('stats-updated', handleStatsUpdate);
    return () => {
      window.removeEventListener('stats-updated', handleStatsUpdate);
    };
  }, [pathname]);

  const getTimeElapsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs <= 0) return 'Just now';

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 h-[400px] animate-pulse"></div>
    );
  }

  // Pre-mapped names to initials colors to represent user avatars elegantly
  const avatarColors = [
    'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    'bg-[#FDF2F8] text-[#DB2777] border-[#FBCFE8]',
    'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 hover:border-[#CBD5E1] transition-all-150 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-3 flex justify-between items-center mb-4">
        <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">
          Activity Log
        </h3>
        <span className="text-[11px] font-semibold text-[#64748B]">Realtime</span>
      </div>

      {/* Feed List */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-xs font-semibold text-[#64748B]">
            No recent activity detected.
          </div>
        ) : (
          activities.map((activity, idx) => {
            const avatarStyle = avatarColors[idx % avatarColors.length];
            const initials = activity.customer_name.substring(0, 2).toUpperCase();
            
            return (
              <div key={activity.ticket_id} className="flex gap-3 text-xs items-start">
                {/* User Avatar Circle */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${avatarStyle}`}>
                  {initials}
                </div>

                {/* Content Panel */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[#0F172A] font-bold">
                      {activity.customer_name}
                      <span className="text-[#64748B] font-semibold font-sans normal-case">
                        {' '}created{' '}
                      </span>
                      <Link
                        href={`/tickets/${activity.ticket_id}`}
                        className="font-mono font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                      >
                        {activity.ticket_id}
                      </Link>
                    </p>
                    <span className="text-[10px] font-semibold text-[#94A3B8] whitespace-nowrap">
                      {getTimeElapsed(activity.created_at)}
                    </span>
                  </div>

                  {/* Comment bubble box */}
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-2.5 relative">
                    <p className="text-[11px] font-medium leading-relaxed text-[#1E3A8A]">
                      {activity.subject.length > 90 
                        ? `${activity.subject.substring(0, 90)}...` 
                        : activity.subject}
                    </p>
                  </div>

                  {/* Attachment Block (simulated visual Figma/File block for the first activity) */}
                  {idx === 0 && (
                    <div className="flex items-center justify-between p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mt-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Figma Document SVG */}
                        <div className="w-7 h-7 rounded bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-rose-500 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H9.75m0 18.75h-2.625a3.375 3.375 0 0 1-3.375-3.375V6.125c0-1.005.4-1.968 1.11-2.68.702-.702 1.63-1.07 2.57-1.07H9.75v18.75Z" />
                          </svg>
                        </div>
                        <div className="text-left leading-tight min-w-0">
                          <p className="text-[11px] font-bold text-[#0F172A] truncate">ticket_report.pdf</p>
                          <p className="text-[9px] text-[#64748B] font-semibold">1.4 MB</p>
                        </div>
                      </div>
                      
                      {/* Download button */}
                      <button className="text-[#64748B] hover:text-[#2563EB] p-1 cursor-pointer transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
