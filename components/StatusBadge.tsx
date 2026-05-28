import React from 'react';

export type TicketStatus = 'Open' | 'In Progress' | 'Closed';

interface StatusBadgeProps {
  status: TicketStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let badgeStyles = 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'; // Open (Blue)

  if (status === 'In Progress') {
    badgeStyles = 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'; // In Progress (Yellow/Amber)
  } else if (status === 'Closed') {
    badgeStyles = 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'; // Closed (Green)
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyles}`}>
      {status}
    </span>
  );
}
