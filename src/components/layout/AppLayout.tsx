"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLocked, isSuperAdmin, user } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname === "/auth";
  const isSuperAdminLogin = pathname === "/super-admin/login";
  const isSuperAdminRoute = pathname === "/super-admin" || pathname?.startsWith("/super-admin/");

  useEffect(() => {
    if (mounted) {
      // If on super admin routes (excluding super admin login)
      if (isSuperAdminRoute && !isSuperAdminLogin) {
        if (!isAuthenticated || isLocked || !isSuperAdmin) {
          router.replace("/super-admin/login");
        }
      } else if (!isAuthPage && !isSuperAdminLogin) {
        // Standard devotee routes
        if (!isAuthenticated || isLocked) {
          router.replace("/auth");
        }
      }
    }
  }, [mounted, isAuthenticated, isLocked, isAuthPage, isSuperAdminLogin, isSuperAdminRoute, isSuperAdmin, router]);

  // Standalone Full-Screen Pages (Devotee Auth & Super Admin Login)
  if (!mounted || isAuthPage || isSuperAdminLogin || !isAuthenticated || isLocked) {
    return (
      <div className="h-full w-full min-h-screen bg-[#FAF8F5] text-stone-900">
        {children}
      </div>
    );
  }

  // Dedicated Isolated Super Admin Workspace (NO Home, Thal, Sabha, Kitchen, etc.)
  if (isSuperAdminRoute) {
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
  }

  // Standard Devotee / Volunteer / Mandir Layout
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#FAF8F5] text-stone-900">
      {/* Desktop Devotee Sidebar */}
      <Sidebar />

      {/* Main Application Column */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#FAF8F5]">
        <Header />

        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 bg-[#FAF8F5]">
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
