'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Ticket {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: any[];
}

export interface SidebarStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
}

interface TicketsContextType {
  tickets: Ticket[];
  stats: SidebarStats | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  updateTicketStatusOptimistically: (ticketId: string, newStatus: string) => Promise<boolean>;
  addNoteOptimistically: (ticketId: string, noteText: string) => Promise<boolean>;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<SidebarStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/stats')
      ]);

      if (ticketsRes.ok && statsRes.ok) {
        const ticketsData = await ticketsRes.json();
        const statsData = await statsRes.json();
        setTickets(ticketsData);
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching TicketsContext data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false); // Initial load is NOT silent

    // Listen to custom stats-updated events for global synchronization
    const handleSync = () => {
      fetchData(true); // Silent refresh!
    };

    window.addEventListener('stats-updated', handleSync);
    return () => {
      window.removeEventListener('stats-updated', handleSync);
    };
  }, []);

  const refreshData = async () => {
    await fetchData(true); // Silent on manual refresh to avoid flash
  };

  const updateTicketStatusOptimistically = async (ticketId: string, newStatus: string): Promise<boolean> => {
    // 1. Optimistically update local tickets array
    const oldTickets = [...tickets];
    const oldStats = stats ? { ...stats } : null;

    setTickets(prev => 
      prev.map(t => t.ticket_id === ticketId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t)
    );

    // 2. Optimistically recalculate sidebar stats counts
    if (stats) {
      const ticketToMove = tickets.find(t => t.ticket_id === ticketId);
      if (ticketToMove && ticketToMove.status !== newStatus) {
        const nextStats = { ...stats };
        // Decrement old status count
        if (ticketToMove.status === 'Open') nextStats.open = Math.max(0, nextStats.open - 1);
        if (ticketToMove.status === 'In Progress') nextStats.inProgress = Math.max(0, nextStats.inProgress - 1);
        if (ticketToMove.status === 'Closed') nextStats.closed = Math.max(0, nextStats.closed - 1);

        // Increment new status count
        if (newStatus === 'Open') nextStats.open += 1;
        if (newStatus === 'In Progress') nextStats.inProgress += 1;
        if (newStatus === 'Closed') nextStats.closed += 1;

        setStats(nextStats);
      }
    }

    // 3. Concurrently trigger Postgres database update in background
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Postgres update failed');
      
      // Notify sidebar & panels
      window.dispatchEvent(new Event('stats-updated'));
      return true;
    } catch (err) {
      console.error('Background status update failed, rolling back:', err);
      // Rollback on failure
      setTickets(oldTickets);
      setStats(oldStats);
      return false;
    }
  };

  const addNoteOptimistically = async (ticketId: string, noteText: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: noteText }),
      });

      if (res.ok) {
        // Silent data refresh
        fetchData(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Background note submission failed:', err);
      return false;
    }
  };

  return (
    <TicketsContext.Provider value={{
      tickets,
      stats,
      loading,
      refreshData,
      updateTicketStatusOptimistically,
      addNoteOptimistically
    }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketsContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
}
