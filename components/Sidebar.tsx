'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTickets } from '@/lib/TicketsContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { stats } = useTickets();

  // Stateful UI expanders
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');

  // Sync state with URL query parameters on load or path changes safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search') || '';
      const status = params.get('status') || 'All';
      setSearchVal(search);
      setActiveStatus(status);
      if (search) setSearchOpen(true);
      if (status !== 'All') setFilterOpen(true);
    }
  }, [pathname]);

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (val) {
        params.set('search', val);
      } else {
        params.delete('search');
      }
      const query = params.toString();
      router.push(query ? `/tickets?${query}` : '/tickets');
    }
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (status !== 'All') {
        params.set('status', status);
      } else {
        params.delete('status');
      }
      const query = params.toString();
      router.push(query ? `/tickets?${query}` : '/tickets');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/login', { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Section 1: GENERAL
  const generalLinks = [
    {
      name: 'Dashboard',
      href: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    {
      name: 'All Tickets',
      href: '/tickets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5-6.75h16.5m-16.5 13.5h16.5" />
        </svg>
      )
    },
    {
      name: 'Kanban Board',
      href: '/tickets/board',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-12-3h18m-18-6h18m-18-6h18" />
        </svg>
      )
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 3 18.375v-5.25ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-9.75ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      )
    },
    {
      name: 'Create Ticket',
      href: '/tickets/new',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col fixed h-screen left-0 top-0 text-[#0F172A] z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-[#E2E8F0] flex items-center px-6 gap-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" className="w-8 h-8 text-[#0F172A] flex-shrink-0">
          {/* Connecting Tracks */}
          <line x1="10" y1="20" x2="20" y2="10" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
          <line x1="10" y1="30" x2="30" y2="10" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
          <line x1="20" y1="30" x2="30" y2="20" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
          
          {/* Overlapping Nodes */}
          <circle cx="10" cy="20" r="4.25" fill="#FFFFFF" />
          <circle cx="10" cy="20" r="3.25" fill="currentColor" />
          <circle cx="20" cy="10" r="4.25" fill="#FFFFFF" />
          <circle cx="20" cy="10" r="3.25" fill="currentColor" />
          
          <circle cx="10" cy="30" r="4.25" fill="#FFFFFF" />
          <circle cx="10" cy="30" r="3.25" fill="currentColor" />
          <circle cx="20" cy="20" r="4.25" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="3.25" fill="currentColor" />
          <circle cx="30" cy="10" r="4.25" fill="#FFFFFF" />
          <circle cx="30" cy="10" r="3.25" fill="currentColor" />
          
          <circle cx="20" cy="30" r="4.25" fill="#FFFFFF" />
          <circle cx="20" cy="30" r="3.25" fill="currentColor" />
          <circle cx="30" cy="20" r="4.25" fill="#FFFFFF" />
          <circle cx="30" cy="20" r="3.25" fill="currentColor" />
        </svg>
        <Link href="/" className="font-light text-2xl tracking-wide text-[#0F172A] hover:text-[#2563EB] transition-colors">
          StreamDesk
        </Link>
      </div>

      {/* Grouped Links Navigation */}
      <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
        {/* GENERAL Section */}
        <div>
          <h3 className="text-[10px] font-semibold tracking-[0.08em] text-[#64748B] uppercase mb-2.5 px-2">
            General
          </h3>
          <nav className="space-y-1">
            {generalLinks.map((link) => {
              // Advanced highlight resolver: All Tickets (link.href === '/tickets') stays highlighted on detail paths!
              const isActive = link.href === '/tickets' 
                ? (pathname === '/tickets' || (pathname.startsWith('/tickets/') && pathname !== '/tickets/new' && pathname !== '/tickets/board'))
                : (pathname === link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 py-2 px-3 rounded-md text-xs font-semibold transition-all-150 ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* TOOLS Section */}
        <div>
          <h3 className="text-[10px] font-semibold tracking-[0.08em] text-[#64748B] uppercase mb-2.5 px-2">
            Tools
          </h3>
          <nav className="space-y-1">
            {/* Search Tool expander */}
            <div>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-md text-xs font-semibold transition-all-150 cursor-pointer ${
                  searchOpen
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                  </svg>
                  <span>Search</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className={`w-3 h-3 transition-transform duration-200 ${searchOpen ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {searchOpen && (
                <div className="px-2.5 py-2 mt-1 space-y-1.5 border-l-2 border-slate-100 ml-5 transition-all">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type query..."
                      value={searchVal}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] text-[#0F172A] placeholder-[#64748B] transition-colors"
                    />
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[#64748B]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Tool expander */}
            <div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-md text-xs font-semibold transition-all-150 cursor-pointer ${
                  filterOpen
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                  </svg>
                  <span>Filter</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className={`w-3 h-3 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {filterOpen && (
                <div className="mt-1 border-l-2 border-slate-100 ml-5 pl-1.5 py-1 space-y-1 transition-all">
                  {['All', 'Open', 'In Progress', 'Closed'].map((status) => {
                    const isSelected = activeStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#EFF6FF] text-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            status === 'All' ? 'bg-[#64748B]' :
                            status === 'Open' ? 'bg-[#2563EB]' :
                            status === 'In Progress' ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                          }`} />
                          <span>{status}</span>
                        </div>
                        {stats && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-[#BFDBFE]/50 text-[#2563EB]' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {status === 'All' ? stats.total :
                             status === 'Open' ? stats.open :
                             status === 'In Progress' ? stats.inProgress : stats.closed}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* SUPPORT Section */}
        <div>
          <h3 className="text-[10px] font-semibold tracking-[0.08em] text-[#64748B] uppercase mb-2.5 px-2">
            Support
          </h3>
          <nav className="space-y-1">
            <Link
              href="/#settings"
              className="flex items-center gap-3 py-2 px-3 rounded-md text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA] transition-all-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Sidebar Footer User Card */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8F9FA] flex flex-col justify-end">
        {/* User Profile Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-xs font-bold text-[#2563EB]">
              AD
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-[#0F172A]">admin</p>
              <p className="text-[10px] text-[#64748B] font-semibold tracking-wide uppercase">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-[#64748B] hover:text-[#D32F2F] transition-colors p-1 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
