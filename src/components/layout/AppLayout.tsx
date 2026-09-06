"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname === "/auth";

  useEffect(() => {
    if (mounted && !isAuthenticated && !isAuthPage) {
      router.replace("/auth");
    }
  }, [mounted, isAuthenticated, isAuthPage, router]);

  // Before authenticating or when on /auth page, render ONLY the full-screen page content without sidebar or header
  if (!mounted || isAuthPage || !isAuthenticated) {
    return (
      <div className="h-full w-full min-h-screen bg-[#08090d] text-white">
        {children}
      </div>
    );
  }

  // Once authenticated, render main dashboard with Sidebar, Header, and Navigation
  return (
    <div className="flex h-full w-full overflow-hidden bg-canvas">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Application Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Floating Tab Bar */}
        <MobileNav />
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />
    </div>
  );
}
