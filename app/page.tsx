'use client';

import React, { useState, useEffect, useRef } from 'react';
import StatCards from '@/components/StatCards';
import StatusDonut from '@/components/StatusDonut';
import RecentActivity from '@/components/RecentActivity';
import PerformanceChart from '@/components/PerformanceChart';
import Link from 'next/link';
import { useTickets } from '@/lib/TicketsContext';

export default function Dashboard() {
  const { tickets } = useTickets();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(28); // Default highlight May 28 (where seeds are)
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on click-outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar dates math for May 2026
  // May 1st 2026 starts on Friday (5 blank cells at start: Su, Mo, Tu, We, Th)
  const daysInMonth = 31;
  const blankDays = 5; 
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Map dates containing tickets
  const getTicketsForDay = (day: number) => {
    return tickets.filter((t) => {
      const date = new Date(t.created_at);
      return date.getFullYear() === 2026 && date.getMonth() === 4 && date.getDate() === day;
    });
  };

  const selectedDayTickets = selectedDate ? getTicketsForDay(selectedDate) : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full select-none relative">
      {/* Top Greeting Header with Interactive Calendar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-[#0F172A]">Hello, admin</h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">Track support ticket metrics here. You are close to resolving all critical logs!</p>
        </div>
        
        {/* Calendar Picker Trigger */}
        <div ref={calendarRef} className="relative">
          <button 
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer w-fit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-4 h-4 text-[#64748B]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span>{selectedDate ? `${selectedDate} May, 2026` : 'Select Date'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${calendarOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Popover Calendar Dropdown */}
          {calendarOpen && (
            <div className="absolute right-0 mt-2.5 bg-white border border-[#E2E8F0] shadow-xl rounded-xl p-4 w-72 z-40 space-y-3.5 animate-fadeIn">
              {/* Month Header */}
              <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                <span>May 2026</span>
                <span className="text-[10px] text-[#64748B] font-semibold">CRM Database Calendar</span>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#64748B]">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Grid dates */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Empty slots for spacing */}
                {Array.from({ length: blankDays }).map((_, idx) => (
                  <span key={`blank-${idx}`} className="w-8 h-8" />
                ))}

                {/* Date numbers */}
                {daysArray.map((day) => {
                  const dayTickets = getTicketsForDay(day);
                  const hasTickets = dayTickets.length > 0;
                  const isSelected = selectedDate === day;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center relative font-semibold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#2563EB] text-white font-bold' 
                          : 'hover:bg-slate-50 text-[#0F172A]'
                      }`}
                    >
                      <span className={hasTickets ? '-translate-y-0.5' : ''}>{day}</span>
                      {hasTickets && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${
                          isSelected ? 'bg-white' : 'bg-[#2563EB]'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Highlight details for the clicked date */}
              {selectedDate && (
                <div className="border-t border-[#E2E8F0] pt-2.5 text-[11px]">
                  <p className="font-bold text-[#64748B] mb-1.5 flex justify-between">
                    <span>May {selectedDate} Support Tasks</span>
                    <span className="text-[#2563EB] font-bold">{selectedDayTickets.length} Active</span>
                  </p>
                  {selectedDayTickets.length === 0 ? (
                    <p className="text-slate-400 italic">No tickets logged on this date.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[85px] overflow-y-auto pr-0.5">
                      {selectedDayTickets.map((t) => (
                        <div key={t.ticket_id} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded px-1.5 py-1 text-left">
                          <Link href={`/tickets/${t.ticket_id}`} className="font-mono font-bold text-[#2563EB] hover:underline">
                            {t.ticket_id}
                          </Link>
                          <span className="text-[#0F172A] font-semibold truncate max-w-[120px] ml-1.5">
                            {t.customer_name}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ml-auto leading-none ${
                            t.status === 'Open' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            t.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Columns Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 width) - Charts & Stats Only! */}
        <div className="lg:col-span-2 space-y-8 w-full">
          {/* 1. StatCards Row */}
          <StatCards />

          {/* 2. Custom Interactive Line Chart */}
          <PerformanceChart />

          {/* 3. Operational Goals & Teammate Workloads card (Fills the blank space!) */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 hover:border-[#CBD5E1] transition-all-150 space-y-6">
            <div>
              <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">Operational Goals & Team Progress</h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium">SLA compliance parameters and workload balancing metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Left Box: SLA Compliance Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0F172A]">Urgent SLA Compliance (Under 4h)</span>
                  <span className="text-[#2563EB]">88%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full transition-all duration-500" style={{ width: '88%' }} />
                </div>
                <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider leading-none">
                  Goal: 95% compliance • Current: 7/8 tickets met target
                </p>

                <div className="flex items-center justify-between text-xs font-bold pt-2">
                  <span className="text-[#0F172A]">Weekly Closed Tickets Quota</span>
                  <span className="text-[#16A34A]">60%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#16A34A] rounded-full transition-all duration-500" style={{ width: '60%' }} />
                </div>
                <p className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider leading-none">
                  Goal: 20 closed tickets • Current: 12 closed
                </p>
              </div>

              {/* Right Box: Teammate Workloads list */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-[#E2E8F0] pt-4 md:pt-0 md:pl-8">
                <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
                  Teammate Workload Caps
                </h4>
                
                <div className="space-y-3 text-xs">
                  {/* Megan Norton */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                      MN
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="truncate text-[#0F172A]">Megan Norton (Admin)</span>
                        <span className="text-slate-500">2 Active (40%)</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#DB2777] rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Floyd Miles */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                      FM
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="truncate text-[#0F172A]">Floyd Miles (Senior Tech)</span>
                        <span className="text-slate-500">3 Active (90%)</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Kristin Watson */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                      KW
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="truncate text-[#0F172A]">Kristin Watson (Junior Specialist)</span>
                        <span className="text-slate-500">1 Active (20%)</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#059669] rounded-full" style={{ width: '20%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panel (1/3 width) */}
        <div className="lg:col-span-1 space-y-8 w-full">
          {/* A. Operator Profile Widget */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 text-center space-y-5 hover:border-[#CBD5E1] transition-all-150">
            <div className="flex flex-col items-center">
              {/* Avatar frame */}
              <div className="w-18 h-18 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-xl font-bold text-[#2563EB] shadow-inner mb-3">
                AD
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">admin</h4>
              <p className="text-[10px] text-[#64748B] font-semibold tracking-wide uppercase mt-0.5">Administrator</p>
            </div>

            {/* Quick action buttons */}
            <div className="flex justify-center gap-3">
              <button 
                title="Call Support Admin"
                className="w-9 h-9 rounded-full border border-[#E2E8F0] hover:bg-slate-50 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.017 12.017 0 0 1-4.822-4.822c-.155-.44.01-1.21.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </button>
              <button 
                title="Start Video Meeting"
                className="w-9 h-9 rounded-full border border-[#E2E8F0] hover:bg-slate-50 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </button>
              <button 
                title="More Actions"
                className="w-9 h-9 rounded-full border border-[#E2E8F0] hover:bg-slate-50 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* B. Status Ratio Distribution (PieChart) */}
          <StatusDonut />

          {/* C. Timeline Activity Feed */}
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
