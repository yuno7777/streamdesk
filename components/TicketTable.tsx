import React from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';

export interface Ticket {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: string;
  created_at: string;
}

interface TicketTableProps {
  tickets: Ticket[];
}

export default function TicketTable({ tickets }: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-center shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-[#94A3B8] mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <h3 className="text-sm font-semibold text-[#0F172A] mb-1">No tickets found</h3>
        <p className="text-sm text-[#64748B] max-w-sm">
          There are no support tickets matching your current search term or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F8F9FA] border-b-2 border-[#E2E8F0] text-[#64748B] text-xs font-bold uppercase tracking-widest">
              <th className="px-6 py-4 font-extrabold">Ticket ID</th>
              <th className="px-6 py-4 font-extrabold">Customer</th>
              <th className="px-6 py-4 font-extrabold">Subject</th>
              <th className="px-6 py-4 font-extrabold">Status</th>
              <th className="px-6 py-4 font-extrabold">Created Date</th>
              <th className="px-6 py-4 font-extrabold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
            {tickets.map((ticket) => (
              <tr
                key={ticket.ticket_id}
                className="hover:bg-[#F8F9FA] transition-all-150 group"
              >
                <td className="px-6 py-5 font-mono font-medium text-[#2563EB]">
                  {ticket.ticket_id}
                </td>
                <td className="px-6 py-5 font-medium">{ticket.customer_name}</td>
                <td className="px-6 py-5 max-w-xs truncate text-[#64748B] group-hover:text-[#0F172A] transition-colors">
                  {ticket.subject}
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-5 text-[#64748B]">
                  {new Date(ticket.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-5 text-right">
                  <Link
                    href={`/tickets/${ticket.ticket_id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] bg-white border border-[#2563EB] rounded px-3 py-1.5 shadow-sm hover:bg-[#EFF6FF] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-all-150 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
