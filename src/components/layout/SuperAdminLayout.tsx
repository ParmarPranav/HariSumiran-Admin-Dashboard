"use client";

import React, { Suspense } from "react";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { SuperAdminHeader } from "./SuperAdminHeader";

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#FAF8F5] text-stone-900">
      {/* Isolated Super Admin Sidebar */}
      <Suspense fallback={<div className="w-64 bg-white border-r border-stone-200" />}>
        <SuperAdminSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#FAF8F5]">
        <SuperAdminHeader />

        <main className="flex-1 overflow-y-auto pb-12 bg-[#FAF8F5]">
          {children}
        </main>
      </div>
    </div>
  );
}

