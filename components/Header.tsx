'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  ticketId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const runSearch = () => {
    const q = searchVal.trim();
    router.push(q ? `/tickets?search=${encodeURIComponent(q)}` : '/tickets');
  };

  // Ctrl/Cmd+K focuses the global search (matches the keyboard hint)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Fetch recent tickets and map them into active notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const tickets = await res.json();
          const mapped: NotificationItem[] = tickets.slice(0, 4).map((t: any) => ({
            id: `notif-${t.ticket_id}`,
            ticketId: t.ticket_id,
            title: `New Ticket ${t.ticket_id}`,
            message: `${t.customer_name} opened support request: "${t.subject}"`,
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: t.status !== 'Open', // Mark resolved/progress tickets as read, open as unread!
          }));
          setNotifications(mapped);
          setUnreadCount(mapped.filter((n) => !n.read).length);
        }
      } catch (err) {
        console.error('Error creating notifications:', err);
      }
    };
    
    loadNotifications();

    // Sync notification loads with path changes or updates
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (ticketId: string, id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    setOpen(false);
    router.push(`/tickets/${ticketId}`);
  };

  // Resolve active page title
  let title = 'Dashboard';
  if (pathname === '/tickets') {
    title = 'All Tickets';
  } else if (pathname === '/tickets/new') {
    title = 'Create Ticket';
  } else if (pathname.startsWith('/tickets/')) {
    title = 'Ticket Details';
  }

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20 shadow-sm text-[#0F172A]">
      {/* Title */}
      <h2 className="text-lg font-light tracking-tight text-[#0F172A] select-none">{title}</h2>

      {/* Right Side Controls */}
      <div className="flex items-center gap-6">
        {/* Global ticket search with KBD hint */}
        <div className="relative w-64 hidden sm:block">
          <label htmlFor="global-search-input" className="sr-only">Search tickets</label>
          <input
            id="global-search-input"
            ref={searchRef}
            type="text"
            className="w-full pl-3 pr-16 py-1.5 text-xs bg-[#F8F9FA] border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] text-[#0F172A] placeholder-[#64748B] transition-all-150"
            placeholder="Search tickets..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch();
              if (e.key === 'Escape') searchRef.current?.blur();
            }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none select-none">
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] rounded shadow-sm">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Notifications Icon with Working Dropdown */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setOpen(!open)}
            className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1 cursor-pointer focus:outline-none relative flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
            )}
          </button>

          {/* Popover Dropdown Card */}
          {open && (
            <div className="absolute right-0 mt-3 bg-[#FFFFFF] border border-[#E2E8F0] shadow-xl rounded-xl w-80 p-4 z-40 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 flex-shrink-0">
                <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-[#2563EB] hover:underline cursor-pointer border-0 bg-transparent"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic font-semibold">
                  No notifications recorded.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n.ticketId, n.id)}
                      className={`w-full text-left p-2 rounded-lg border text-xs flex gap-2 items-start transition-all cursor-pointer ${
                        n.read 
                          ? 'bg-slate-50 border-slate-100 text-[#64748B]' 
                          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A] font-medium'
                      }`}
                    >
                      {/* Status indicator circle */}
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        n.read ? 'bg-slate-300' : 'bg-[#2563EB] animate-pulse'
                      }`} />
                      
                      <div className="flex-1 min-w-0 leading-tight">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="font-bold truncate">{n.title}</p>
                          <span className="text-[9px] text-[#94A3B8] font-semibold">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User initials profile widget */}
        <div className="flex items-center gap-3 border-l border-[#E2E8F0] pl-6">
          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-xs font-bold text-[#2563EB] select-none font-sans">
            AD
          </div>
          <div className="hidden md:block text-left select-none">
            <p className="text-xs font-bold text-[#0F172A] leading-tight">admin</p>
            <p className="text-[10px] text-[#64748B] font-semibold tracking-wide uppercase">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
