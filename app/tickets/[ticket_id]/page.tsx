'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTickets } from '@/lib/TicketsContext';
import StatusBadge from '@/components/StatusBadge';
import NotesFeed from '@/components/NotesFeed';

interface TicketDetailProps {
  params: Promise<{ ticket_id: string }>;
}

export default function TicketDetail({ params }: TicketDetailProps) {
  const { ticket_id } = use(params);
  const router = useRouter();
  const { tickets, updateTicketStatusOptimistically, addNoteOptimistically } = useTickets();

  const [ticket, setTicket] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  // Load ticket details from global context cache immediately
  useEffect(() => {
    const found = tickets.find((t) => t.ticket_id === ticket_id);
    if (found) {
      setTicket(found);
    } else {
      // Fallback API query if ticket is not yet in context cache
      const fetchFallback = async () => {
        try {
          const res = await fetch(`/api/tickets/${ticket_id}`);
          if (res.ok) {
            const data = await res.json();
            setTicket(data);
          } else {
            router.push('/tickets');
          }
        } catch (err) {
          console.error('Error fetching fallback details:', err);
          router.push('/tickets');
        }
      };
      if (tickets.length > 0) {
        // If context tickets are loaded but this ID isn't found, redirect
        router.push('/tickets');
      } else {
        fetchFallback();
      }
    }
  }, [ticket_id, tickets, router]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    try {
      setUpdatingStatus(true);
      setShowSavedIndicator(false);
      
      const success = await updateTicketStatusOptimistically(ticket_id, newStatus);
      if (success) {
        setTicket((prev: any) => ({
          ...prev,
          status: newStatus,
          updated_at: new Date().toISOString()
        }));
        
        // Flash success message briefly
        setShowSavedIndicator(true);
        setTimeout(() => setShowSavedIndicator(false), 2000);
      }
    } catch (err) {
      console.error('Failed to alter status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (noteText: string) => {
    const success = await addNoteOptimistically(ticket_id, noteText);
    if (success) {
      // Reload ticket details from database silently
      try {
        const res = await fetch(`/api/tickets/${ticket_id}`);
        if (res.ok) {
          const data = await res.json();
          setTicket(data);
        }
      } catch (err) {
        console.error('Failed to sync notes feed:', err);
      }
    }
  };

  if (!ticket) {
    return (
      <div className="flex-1 py-4 px-8 max-w-7xl mx-auto w-full select-none">
        {/* Loading skeleton */}
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl animate-pulse"></div>
          </div>
          <div className="h-96 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-4 px-8 max-w-7xl mx-auto w-full select-none">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
        <Link href="/tickets" className="hover:text-[#0F172A] transition-colors">
          Tickets
        </Link>
        <span className="mx-2 text-[#E2E8F0]">/</span>
        <span className="text-[#0F172A]">{ticket.ticket_id}</span>
      </nav>

      {/* Main Grid Overhauled to modern 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Center Workspace: Ticket Metadata Card */}
        <div className="lg:col-span-2 space-y-6 w-full">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden hover:border-[#CBD5E1] transition-all-150">
            {/* Header info */}
            <div className="px-6 py-4.5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 bg-[#F8F9FA]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#64748B] tracking-wider">{ticket.ticket_id}</span>
                <StatusBadge status={ticket.status} />
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="status-modifier" className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Status:
                </label>
                <select
                  id="status-modifier"
                  value={ticket.status}
                  onChange={handleStatusChange}
                  disabled={updatingStatus}
                  className="bg-white border border-[#CBD5E1] text-xs text-[#0F172A] px-2.5 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] font-bold transition-all-150 cursor-pointer disabled:opacity-50"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
                {showSavedIndicator && (
                  <span className="text-xs text-[#16A34A] font-bold animate-fade-in pl-1">
                    Saved
                  </span>
                )}
              </div>
            </div>

            {/* Content info */}
            <div className="p-6 space-y-6">
              {/* Customer details row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-[#E2E8F0]">
                <div>
                  <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Customer Details
                  </h4>
                  <p className="text-xs font-bold text-[#0F172A]">{ticket.customer_name}</p>
                  <p className="text-xs text-[#64748B] font-semibold mt-0.5">{ticket.customer_email}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Timeline Logs
                  </h4>
                  <p className="text-xs text-[#64748B] font-semibold">
                    Created:{' '}
                    <span className="font-bold text-[#0F172A]">
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-[#64748B] font-semibold mt-1">
                    Last Activity:{' '}
                    <span className="font-bold text-[#0F172A]">
                      {new Date(ticket.updated_at).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Subject details row */}
              <div>
                <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Subject Line
                </h4>
                <h2 className="text-base font-bold text-[#0F172A] leading-snug">
                  {ticket.subject}
                </h2>
              </div>

              {/* Detailed Description row */}
              <div>
                <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Description
                </h4>
                <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-4.5">
                  <p className="text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed font-medium">
                    {ticket.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column Panel Stack */}
        <div className="lg:col-span-1 space-y-6 w-full h-full">
          {/* A. Operator profile quick details */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 text-center space-y-5 hover:border-[#CBD5E1] transition-all-150">
            <div className="flex flex-col items-center">
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
            </div>
          </div>

          {/* B. Timeline Notes Feed */}
          <NotesFeed 
            notes={ticket.notes || []} 
            customerName={ticket.customer_name} 
            onAddNote={handleAddNote} 
          />
        </div>
      </div>
    </div>
  );
}
