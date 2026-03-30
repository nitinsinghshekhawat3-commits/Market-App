'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import Layout components with ssr disabled to avoid server-side rendering issues
const Sidebar = dynamic(() => import('../../components/Layout').then((m) => ({ default: m.Sidebar })), { 
  ssr: false,
  loading: () => <div className="w-64 bg-white/50" />
});

const Topbar = dynamic(() => import('../../components/Layout').then((m) => ({ default: m.Topbar })), {
  ssr: false,
  loading: () => <div className="h-24 bg-white/50" />
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 bg-gradient-to-br from-slate-50 via-white to-green-50/30 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto mt-24 mr-4 mb-4">{children}</main>
      </div>
    </div>
  );
}
