'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateTicket() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend Presence Validation
    if (!customerName.trim() || !customerEmail.trim() || !subject.trim() || !description.trim()) {
      setErrorMessage('All form fields are strictly required.');
      return;
    }

    // Email format checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      setErrorMessage('Please enter a valid format for customer email.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          subject: subject.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create support ticket.');
      }

      const data = await res.json();
      
      // Dispatch statistics update event locally
      window.dispatchEvent(new Event('stats-updated'));

      // Forward user straight to detail panel
      router.push(`/tickets/${data.ticket_id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 py-4 px-8 max-w-2xl mx-auto w-full select-none">
      {/* Breadcrumb utility navigation */}
      <nav className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
        <Link href="/tickets" className="hover:text-[#0F172A] transition-colors">
          Tickets
        </Link>
        <span className="mx-2 text-[#E2E8F0]">/</span>
        <span className="text-[#0F172A]">New Ticket</span>
      </nav>

      {/* Header Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight text-[#0F172A]">Create Ticket</h1>
        <p className="text-xs text-[#64748B] mt-0.5 font-medium">
          Scaffold and assign a new customer request in the system database.
        </p>
      </div>

      {/* Form Submission Container */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 hover:border-[#CBD5E1] transition-all-150">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-[#FFF5F5] border border-[#FEE2E2] text-[#D32F2F] text-xs px-4 py-3 rounded-lg font-bold">
              {errorMessage}
            </div>
          )}

          {/* Group Name & Email side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="customer-name" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Customer Name
              </label>
              <input
                id="customer-name"
                type="text"
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] placeholder-[#94A3B8] text-[#0F172A] transition-all-150"
                placeholder="e.g. Abhishek Satarkar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Customer Email */}
            <div>
              <label htmlFor="customer-email" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Customer Email
              </label>
              <input
                id="customer-email"
                type="email"
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] placeholder-[#94A3B8] text-[#0F172A] transition-all-150"
                placeholder="e.g. abhishek@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label htmlFor="subject" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] placeholder-[#94A3B8] text-[#0F172A] transition-all-150"
              placeholder="Summarize the core request"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Detailed Request */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              rows={6}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] placeholder-[#94A3B8] text-[#0F172A] resize-none transition-all-150"
              placeholder="Elaborate on details, technical details, or system logs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] pt-6">
            <Link
              href="/tickets"
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F9FA] rounded-lg border border-[#E2E8F0] bg-white transition-all-150 cursor-pointer text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all-150 shadow-sm cursor-pointer border-0"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
