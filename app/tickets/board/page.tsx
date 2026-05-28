'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTickets } from '@/lib/TicketsContext';

interface SLAMetrics {
  label: string;
  badgeClass: string;
  isOverdue: boolean;
  timeText: string;
}

export default function KanbanBoard() {
  const { tickets, loading, updateTicketStatusOptimistically } = useTickets();
  const [localTickets, setLocalTickets] = useState<any[]>([]);
  const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null);

  // Sync internal state with TicketsContext cache
  useEffect(() => {
    setLocalTickets(tickets);
  }, [tickets]);

  // SLA math calculation
  const calculateSLA = (createdAt: string, ticketId: string, subject: string): SLAMetrics => {
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const elapsedHours = (now - createdTime) / 3600000;

    // Resolve priority deterministically
    let priority = 'Low';
    let limitHours = 24;

    const lowerSubject = subject.toLowerCase();
    const numericId = parseInt(ticketId.replace(/\D/g, ''), 10) || 0;

    if (lowerSubject.includes('urgent') || lowerSubject.includes('error') || lowerSubject.includes('fail') || numericId % 3 === 1) {
      priority = 'Urgent';
      limitHours = 4;
    } else if (lowerSubject.includes('setup') || lowerSubject.includes('how') || numericId % 3 === 2) {
      priority = 'Medium';
      limitHours = 12;
    }

    const remainingHours = limitHours - elapsedHours;

    if (remainingHours <= 0) {
      const overdueBy = Math.abs(Math.floor(remainingHours));
      return {
        label: `${priority} SLA`,
        badgeClass: 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse border',
        isOverdue: true,
        timeText: overdueBy === 0 ? 'Overdue' : `Overdue by ${overdueBy}h`
      };
    } else if (remainingHours < 2) {
      const remainingMins = Math.floor(remainingHours * 60);
      return {
        label: `${priority} SLA`,
        badgeClass: 'bg-amber-50 border-amber-100 text-amber-600 border font-bold',
        isOverdue: false,
        timeText: `Breaches in ${remainingMins}m`
      };
    } else {
      const remainingHr = Math.floor(remainingHours);
      return {
        label: `${priority} SLA`,
        badgeClass: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] border',
        isOverdue: false,
        timeText: `${remainingHr}h remaining`
      };
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDraggingTicketId(ticketId);
    e.dataTransfer.setData('text/plain', ticketId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain') || draggingTicketId;
    if (!ticketId) return;

    // Optimistically transition local state to avoid server lag visual skips
    const ticketToMove = localTickets.find(t => t.ticket_id === ticketId);
    if (ticketToMove && ticketToMove.status !== newStatus) {
      setLocalTickets(prev =>
        prev.map(t => t.ticket_id === ticketId ? { ...t, status: newStatus } : t)
      );
      
      // Fire context dispatcher to trigger Postgres background write & stats sync
      await updateTicketStatusOptimistically(ticketId, newStatus);
    }
    setDraggingTicketId(null);
  };

  const columns = [
    { key: 'Open', title: 'Open Tickets', border: 'border-blue-200', bg: 'bg-[#EFF6FF]/20', badge: 'bg-blue-50 text-blue-600 border-blue-100' },
    { key: 'In Progress', title: 'In Progress', border: 'border-amber-200', bg: 'bg-[#FFFBEB]/20', badge: 'bg-amber-50 text-amber-600 border-amber-100' },
    { key: 'Closed', title: 'Closed / Resolved', border: 'border-emerald-200', bg: 'bg-[#F0FDF4]/20', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  ];

  if (loading) {
    return (
      <div className="flex-1 py-4 px-8 max-w-7xl mx-auto w-full select-none">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-white border border-[#E2E8F0] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-4 px-8 max-w-7xl mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-[#0F172A] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-[#2563EB]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-12-3h18m-18-6h18m-18-6h18" />
            </svg>
            Interactive Kanban Board
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium pl-8">Drag support tickets between columns to update Postgres status in real-time</p>
        </div>

        <Link
          href="/tickets"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-[#64748B]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5-6.75h16.5m-16.5 13.5h16.5" />
          </svg>
          <span>List View</span>
        </Link>
      </div>

      {/* Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {columns.map((col) => {
          const colTickets = localTickets.filter((t) => t.status === col.key);

          return (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`rounded-xl border ${col.border} p-4.5 min-h-[500px] flex flex-col ${col.bg} transition-all duration-150`}
            >
              {/* Column Title */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 flex-shrink-0">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">{col.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none ${col.badge}`}>
                  {colTickets.length}
                </span>
              </div>

              {/* Tickets list container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[550px] pr-0.5">
                {colTickets.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400 italic font-semibold">
                    Drag tickets here
                  </div>
                ) : (
                  colTickets.map((t) => {
                    const sla = calculateSLA(t.created_at, t.ticket_id, t.subject);
                    const isUrgent = sla.label.startsWith('Urgent');

                    return (
                      <div
                        key={t.ticket_id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.ticket_id)}
                        className={`bg-white border rounded-lg shadow-sm p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150 relative space-y-3 ${
                          t.ticket_id === draggingTicketId 
                            ? 'opacity-40 border-slate-300' 
                            : isUrgent ? 'border-l-4 border-l-rose-500 border-slate-200' : 'border-slate-200'
                        }`}
                      >
                        {/* Card Header details */}
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <Link 
                            href={`/tickets/${t.ticket_id}`} 
                            className="font-mono text-[#2563EB] hover:underline"
                          >
                            {t.ticket_id}
                          </Link>
                          
                          <span className={`px-2 py-0.5 rounded-full text-[9px] ${sla.badgeClass}`}>
                            {sla.timeText}
                          </span>
                        </div>

                        {/* Customer */}
                        <div className="text-[11px] leading-tight">
                          <p className="font-bold text-[#0F172A]">{t.customer_name}</p>
                          <p className="text-[#64748B] font-semibold mt-0.5 truncate">{t.customer_email}</p>
                        </div>

                        {/* Subject */}
                        <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                          {t.subject}
                        </p>

                        {/* Footer details link */}
                        <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] font-bold text-[#64748B]">
                          <span className="text-[9px] uppercase tracking-wide bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                            {sla.label}
                          </span>
                          <Link 
                            href={`/tickets/${t.ticket_id}`} 
                            className="text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer"
                          >
                            <span>View</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5M3 12h12.75" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
