'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Baseline validation
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        // Dispatch stats trigger locally for updates
        window.dispatchEvent(new Event('stats-updated'));
        
        // Push and refresh
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" className="w-10 h-10 text-[#0F172A] flex-shrink-0">
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
            <span className="font-light text-3xl tracking-wide text-[#0F172A]">
              StreamDesk
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-2 font-medium">
            Support CRM Administration Sign In
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username-input" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Username
            </label>
            <input
              id="username-input"
              type="text"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] placeholder-[#64748B] text-[#0F172A] transition-all-150"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password-input" className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB] placeholder-[#64748B] text-[#0F172A] transition-all-150"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Action */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 border border-transparent rounded text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          {/* Inline Alert warnings */}
          {errorMessage && (
            <div className="bg-[#FFF5F5] border border-[#FEE2E2] text-[#D32F2F] text-xs px-4 py-3 rounded-md text-center font-bold">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
