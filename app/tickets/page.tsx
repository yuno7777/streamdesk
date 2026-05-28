'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TicketTable from '@/components/TicketTable';
import { useTickets } from '@/lib/TicketsContext';
import { exportTicketsPdf } from '@/lib/exportTicketsPdf';

function TicketsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tickets, loading } = useTickets();
  
  const initialStatus = searchParams.get('status') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);

  // Sync internal state if URL query params change (e.g. from sidebar clicking)
  useEffect(() => {
    setStatusFilter(searchParams.get('status') || 'All');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Synchronize state filters with URL query parameters for routing consistency
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'All') {
      params.set('status', statusFilter);
    }
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    const queryString = params.toString();
    const targetUrl = queryString ? `/tickets?${queryString}` : '/tickets';
    router.replace(targetUrl);
  }, [statusFilter, searchTerm, router]);

  // Execute instantaneous client-side filter and search on cached context list
  useEffect(() => {
    let result = [...tickets];

    // 1. Filter by status
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    // 2. Filter by search query
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(t => 
        t.ticket_id.toLowerCase().includes(query) ||
        t.customer_name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.customer_email.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(result);
  }, [tickets, statusFilter, searchTerm]);

  const handleExportCSV = () => {
    if (filteredTickets.length === 0) return;

    const headers = ['Ticket ID', 'Customer Name', 'Customer Email', 'Subject', 'Status', 'Created At', 'Last Activity'];
    const rows = filteredTickets.map((t) => [
      t.ticket_id,
      `"${t.customer_name.replace(/"/g, '""')}"`,
      t.customer_email,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.status,
      t.created_at,
      t.updated_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `streamdesk_tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const filterLabel = statusFilter !== 'All' ? `Status: ${statusFilter}` : 'All statuses';
    const searchLabel = searchTerm.trim() ? `  •  Search: "${searchTerm.trim()}"` : '';
    exportTicketsPdf(filteredTickets, { subtitle: `${filterLabel}${searchLabel}` });
  };

  const tabs = ['All', 'Open', 'In Progress', 'Closed'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-[#0F172A] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-[#2563EB]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5-6.75h16.5m-16.5 13.5h16.5" />
            </svg>
            Support Tickets Log
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium pl-8">Review, search, and manage all client-side support requests</p>
        </div>

        {/* Export actions */}
        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={filteredTickets.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-[#64748B]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={filteredTickets.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm rounded-lg text-xs font-semibold transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Unified Table Card */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 hover:border-[#CBD5E1] transition-all-150">
        {/* Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 mb-6">
          <div>
            <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">Tickets Database</h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">Safe parameterized database query logs</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Status Tab list */}
            <div className="flex space-x-5 text-xs font-semibold">
              {tabs.map((tab) => {
                const isActive = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`pb-2.5 transition-all-150 border-b-2 focus:outline-none cursor-pointer ${
                      isActive
                        ? 'border-[#2563EB] text-[#2563EB]'
                        : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Inline search bar */}
            <div className="w-full sm:w-60 relative flex items-center">
              <label htmlFor="search-tickets-input" className="sr-only">Search tickets</label>
              <input
                id="search-tickets-input"
                type="text"
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-[#FFFFFF] border border-[#CBD5E1] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] placeholder-[#64748B] text-[#0F172A] transition-all-150"
                placeholder="Search ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {loading && (
                <div className="absolute right-2.5 flex items-center justify-center">
                  <svg className="animate-spin h-3.5 w-3.5 text-[#2563EB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Data */}
        {loading && tickets.length === 0 ? (
          <div className="space-y-4">
            <div className="h-10 bg-slate-50 border border-[#E2E8F0] rounded-md animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-white border border-[#E2E8F0] rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <TicketTable tickets={filteredTickets} />
        )}
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 max-w-7xl mx-auto w-full select-none">
        <div className="h-28 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl animate-pulse"></div>
      </div>
    }>
      <TicketsContent />
    </Suspense>
  );
}
