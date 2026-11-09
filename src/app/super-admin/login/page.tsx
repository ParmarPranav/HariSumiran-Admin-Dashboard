"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DEFAULT_SUPERADMIN_EMAIL = "hpsuperadmin@gmail.com";
const DEFAULT_SUPERADMIN_PASS = "HP@Super#Admin@1809";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { loginSuperAdmin, isSuperAdmin, user, language } = useApp();

  const [email, setEmail] = useState(DEFAULT_SUPERADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_SUPERADMIN_PASS);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in as super admin, redirect to console
  useEffect(() => {
    if (isSuperAdmin && user?.email === DEFAULT_SUPERADMIN_EMAIL) {
      router.push("/super-admin");
    }
  }, [isSuperAdmin, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both Super Admin ID and Password");
      return;
    }

    setLoading(true);
    const success = await loginSuperAdmin(email.trim(), password.trim());
    setLoading(false);

    if (success) {
      router.push("/super-admin");
    }
  };

  const handleQuickFill = () => {
    setEmail(DEFAULT_SUPERADMIN_EMAIL);
    setPassword(DEFAULT_SUPERADMIN_PASS);
    toast.success("Credentials filled", {
      description: "Super Admin credentials populated for testing.",
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#FAF8F5] text-stone-900 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-amber-500/30 selection:text-amber-950 overflow-x-hidden">
      <MandalaBackground />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md border border-stone-200/90 backdrop-blur-md">
            <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg md:text-xl font-bold tracking-tight text-stone-900">HariSumiran</h1>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold text-amber-900 uppercase">
                Root Security Portal
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-widest text-amber-700 font-bold uppercase">
              HariPrabodham, Nadiad
            </p>
          </div>
        </Link>

        <Link
          href="/auth"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white/80 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
        >
          <Users className="h-3.5 w-3.5 text-stone-500" />
          <span>Regular Login</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <GlassCard className="p-6 sm:p-8 bg-white border-stone-200/90 shadow-xl space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-14 w-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-mono font-extrabold text-amber-900 uppercase tracking-wider mb-1">
                Root Access Authentication
              </span>
              <h2 className="font-heading text-2xl font-bold text-stone-900">
                Super Admin Login
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Sign in to manage system roles, administrative scopes, and security authorizations.
              </p>
            </div>
          </div>

          {/* Quick-Fill Helper Pill */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 block text-[11px]">Authorized Credentials:</span>
              <p className="font-mono text-[10px] text-amber-900 truncate">ID: {DEFAULT_SUPERADMIN_EMAIL}</p>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow-2xs transition-all active:scale-95"
            >
              Fill Credentials
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">
                Super Admin ID / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hpsuperadmin@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 text-xs text-stone-900 font-mono placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 text-xs text-stone-900 font-mono placeholder:text-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-md shadow-amber-600/20"
                isLoading={loading}
                leftIcon={<KeyRound className="h-4 w-4" />}
              >
                Sign In to Super Admin Console
              </Button>
            </div>
          </form>

          {/* Security Notice Footer */}
          <div className="pt-2 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Protected by Enterprise End-to-End Encryption
            </p>
          </div>
        </GlassCard>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto text-center py-4 text-[11px] text-stone-500">
        HariSumiran Enterprise Node • HariPrabodham, Nadiad • Super Administration Portal
      </footer>
    </div>
  );
}

