'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '01 May', Incoming: 4, Resolved: 2 },
  { name: '02 May', Incoming: 7, Resolved: 5 },
  { name: '03 May', Incoming: 6, Resolved: 7 },
  { name: '04 May', Incoming: 9, Resolved: 6 },
  { name: '05 May', Incoming: 5, Resolved: 8 },
  { name: '06 May', Incoming: 8, Resolved: 9 },
  { name: '07 May', Incoming: 4, Resolved: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F172A] text-white rounded-lg shadow-xl px-3 py-2 text-left border border-slate-800 w-32 select-none">
        <p className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">{label} 2026</p>
        <div className="mt-1.5 space-y-1 text-[11px] font-semibold">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              <span className="text-slate-300">Incoming</span>
            </div>
            <span>{payload[0].value}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
              <span className="text-slate-300">Resolved</span>
            </div>
            <span>{payload[1].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PerformanceChart() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-xl p-6 hover:border-[#CBD5E1] transition-all-150 relative select-none w-full h-[320px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4 flex-shrink-0">
        <div>
          <h3 className="text-sm font-light text-[#0F172A] uppercase tracking-wider">Performance</h3>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">Daily ticket operations metrics</p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] cursor-pointer hover:bg-slate-100 transition-colors">
          <span>01-07 May 2026</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3 text-[#64748B]">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {/* Recharts AreaChart Container */}
      <div className="flex-1 w-full relative min-h-0 text-[10px] font-bold text-[#64748B]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D97706" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#D97706" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="name" 
              stroke="#94A3B8" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              dy={10} 
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 12]} 
              tickCount={5} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#64748B', strokeWidth: 1.2, strokeDasharray: '3 3' }} />
            
            <Area 
              type="monotone" 
              dataKey="Incoming" 
              stroke="#2563EB" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorIncoming)" 
              dot={{ r: 3.5, stroke: '#FFFFFF', strokeWidth: 1.5, fill: '#2563EB' }}
              activeDot={{ r: 5.5, stroke: '#FFFFFF', strokeWidth: 2, fill: '#2563EB' }}
            />
            <Area 
              type="monotone" 
              dataKey="Resolved" 
              stroke="#D97706" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorResolved)" 
              dot={{ r: 3.5, stroke: '#FFFFFF', strokeWidth: 1.5, fill: '#D97706' }}
              activeDot={{ r: 5.5, stroke: '#FFFFFF', strokeWidth: 2, fill: '#D97706' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend footer */}
      <div className="flex items-center gap-6 text-[11px] font-bold text-[#64748B] mt-4 border-t border-[#E2E8F0] pt-3.5 select-none justify-center flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 bg-[#2563EB] rounded-full inline-block" />
          <span>Incoming Volume</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 bg-[#D97706] rounded-full inline-block" />
          <span>Resolved Rate</span>
        </div>
      </div>
    </div>
  );
}
