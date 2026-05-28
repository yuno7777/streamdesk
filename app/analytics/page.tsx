'use client';

import React from 'react';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTickets } from '@/lib/TicketsContext';
import { exportTicketsPdf } from '@/lib/exportTicketsPdf';

const resolutionData = [
  { name: 'Urgent', Time: 2.1 },
  { name: 'Medium', Time: 6.8 },
  { name: 'Low', Time: 14.5 },
];

const volumeData = [
  { name: 'Wk 1', Tickets: 8 },
  { name: 'Wk 2', Tickets: 14 },
  { name: 'Wk 3', Tickets: 11 },
  { name: 'Wk 4', Tickets: 18 },
];

const satisfactionData = [
  { name: 'Excellent (5★)', value: 65, color: '#16A34A' },
  { name: 'Good (4★)', value: 25, color: '#2563EB' },
  { name: 'Neutral (3★)', value: 10, color: '#D97706' },
];

export default function AnalyticsPage() {
  const { tickets } = useTickets();

  const handleExportCSV = () => {
    if (!tickets || tickets.length === 0) return;

    // Build CSV content
    const headers = ['Ticket ID', 'Customer Name', 'Customer Email', 'Subject', 'Status', 'Created At', 'Last Activity'];
    const rows = tickets.map((t) => [
      t.ticket_id,
      `"${t.customer_name.replace(/"/g, '""')}"`,
      t.customer_email,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.status,
      t.created_at,
      t.updated_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Create a client-side downloadable file URL
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `streamdesk_tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    exportTicketsPdf(tickets, { subtitle: 'All statuses' });
  };

  return (
    <div className="flex-1 py-4 px-8 max-w-7xl mx-auto w-full select-none space-y-8 print:p-0 print:m-0 print:border-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-6 print:pb-2 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-light tracking-tight text-[#0F172A] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-[#2563EB]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 3 18.375v-5.25ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-9.75ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Advanced Operational Analytics
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium pl-8">Evaluate average resolution times, volume spikes, and download spreadsheet reports</p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex gap-3 print:hidden">
          {/* CSV button */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-lg text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5 text-[#64748B]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export CSV</span>
          </button>
          
          {/* PDF button */}
          <button
            onClick={handleExportPDF}
            disabled={!tickets || tickets.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm rounded-lg text-xs font-semibold transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 2.221m-11.28-2.317c.011-.128.024-.256.037-.384m.68 2.701c-.126-.705-.236-1.43-.33-2.16m1.11 2.37c-.125-.134-.263-.258-.412-.371m11.28-2.317a42.42 42.42 0 0 0-10.56-2.221m10.56 2.221c.007.072.013.143.019.215m-10.58-2.436c-.013.128-.024.257-.033.386m-1.11-2.372A42.42 42.42 0 0 0 4.12 12.2m5.753-1.637A42.42 42.42 0 0 1 20.48 12.2m-10.607-1.637c-.01-.13-.02-.261-.027-.393m6.72 13.829a42.421 42.421 0 0 0 3.826-10.82M6.72 13.829c-.086-.754-.154-1.52-.203-2.29M20.48 12.2c.032.228.06.457.082.687m-16.44-.687c.03.228.06.457.082.687m16.358-.687a42.42 42.42 0 0 1-3.826 10.82M6.358 12.2a42.42 42.42 0 0 0 3.826 10.82m10.174-10.82c-.033.229-.067.457-.103.685M6.255 12.885c.033.229.067.457.103.685m10.174-.685a42.42 42.42 0 0 1-3.826 10.82m-6.348-10.82a42.42 42.42 0 0 0 3.826 10.82" />
            </svg>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Grid for Reports Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-bold text-[10px] text-[#64748B]">
        {/* Chart 1: Average Resolution Time (BarChart) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 hover:border-[#CBD5E1] transition-all-150 h-[300px] flex flex-col justify-between">
          <div className="border-b border-[#E2E8F0] pb-3 mb-4">
            <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">Average SLA Resolution Times</h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">Average hours elapsed from ticket creation to Close</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} dy={5} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} tickCount={4} />
                <Tooltip cursor={{ fill: '#EFF6FF', opacity: 0.5 }} />
                <Bar dataKey="Time" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Volume Spikes (AreaChart) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 hover:border-[#CBD5E1] transition-all-150 h-[300px] flex flex-col justify-between">
          <div className="border-b border-[#E2E8F0] pb-3 mb-4">
            <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">Weekly Ticket Volume Spikes</h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">Total support ticket arrivals tracked per week</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} dy={5} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} tickCount={4} />
                <Tooltip />
                <Area type="monotone" dataKey="Tickets" stroke="#D97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVol)" dot={{ r: 3, stroke: '#FFFFFF', strokeWidth: 1 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: CSAT (PieChart) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 hover:border-[#CBD5E1] transition-all-150 h-[280px] flex flex-col justify-between lg:col-span-2">
          <div className="border-b border-[#E2E8F0] pb-3 mb-4">
            <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">Customer Satisfaction Rates (CSAT)</h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">Ratings breakdown compiled from automated resolution surveys</p>
          </div>
          <div className="flex-1 flex items-center justify-center gap-12 py-2 min-h-0 text-[11px] font-semibold">
            {/* Pie SVG chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="90%"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-[#0F172A]">4.8</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Rating</span>
              </div>
            </div>

            {/* Legend layout */}
            <div className="space-y-2.5 max-w-[200px] w-full">
              {satisfactionData.map((d) => (
                <div key={d.name} className="flex justify-between items-center px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: d.color }} />
                    <span className="text-[#0F172A]">{d.name}</span>
                  </div>
                  <span className="text-slate-500 font-bold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
