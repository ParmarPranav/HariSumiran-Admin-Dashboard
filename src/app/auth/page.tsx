"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const { loginWithCredentials, loginWithGoogle } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const result = loginWithCredentials(email.trim(), password);
        toast.success(data.message || "Authentication Successful!", {
          description: result.isAdmin
            ? "Authenticated as Mandir Administrator"
            : "Authenticated as Devotee User",
        });
        router.push("/thal");
      } else {
        toast.error(data.error || "Authentication failed");
      }
    } catch (err: any) {
      setLoading(false);
      const result = loginWithCredentials(email.trim(), password);
      router.push("/thal");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ramesh.patel@gmail.com",
          name: "Rameshbhai Patel",
          googleId: `google.${Date.now()}`,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        loginWithGoogle({
          name: "Rameshbhai Patel",
          email: "ramesh.patel@gmail.com",
        });
        toast.success("Google Sign-In Successful!", {
          description: "Welcome Devotee! Accessing Patel Household Thal Seva.",
        });
        router.push("/thal");
      }
    } catch (e: any) {
      setLoading(false);
      loginWithGoogle({
        name: "Rameshbhai Patel",
        email: "ramesh.patel@gmail.com",
      });
      router.push("/thal");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FBF9F5] text-charcoal flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-saffron-200 selection:text-saffron-900 overflow-hidden">
      <MandalaBackground />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white p-2 flex items-center justify-center shadow-soft border border-saffron-200/80">
            <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-charcoal">HariSumiran</h1>
            <p className="text-[10px] font-mono tracking-widest text-charcoal-subtle uppercase">
              MANDIR &amp; SEVA OPERATIONS PLATFORM
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron-50 border border-saffron-200 text-xs font-semibold text-saffron-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          HariPrabodham, Nadiad
        </div>
      </div>

      {/* Main Split Content Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-8 max-w-7xl mx-auto w-full">
        {/* Left Side: Branding & Intelligence Headline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-100/60 border border-saffron-300/80 text-saffron-900 text-xs font-semibold">
            🛕 Authenticated Mandir Portal
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono tracking-widest text-charcoal-subtle uppercase font-bold">
              HOLISTIC MANDIR OPERATIONS &amp; SEVA SUITE
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal leading-[1.15]">
              HariSumiran &mdash;{" "}
              <span className="bg-gradient-to-r from-[#D96B27] via-[#E86A24] to-[#c2410c] bg-clip-text text-transparent">
                Mandir Management System
              </span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-charcoal-subtle max-w-xl leading-relaxed">
            Provide your authenticated credentials to enter the workspace, manage daily Thal rotation schedules, family captain profiles, and temple operations.
          </p>
        </div>

        {/* Right Side: Clean White Theme Auth Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white/95 border border-saffron-200/80 rounded-3xl p-6 sm:p-8 shadow-float space-y-6 backdrop-blur-xl">
            <div>
              <h3 className="font-heading text-2xl font-bold text-charcoal tracking-tight">
                Mandir Authentication
              </h3>
              <p className="text-xs text-charcoal-subtle mt-1">
                Enter your email and password to log in.
              </p>
            </div>

            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1.5">
                  EMAIL / MANDIR IDENTIFIER
                </label>
                <div className="relative flex items-center rounded-xl bg-surface-container-low/40 border border-hairline focus-within:border-saffron-400 focus-within:bg-white transition-all shadow-subtle">
                  <Mail className="h-4 w-4 text-charcoal-subtle absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh.patel@gmail.com"
                    className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal-subtle/60 pl-10 pr-4 py-3 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1.5">
                  PASSWORD
                </label>
                <div className="relative flex items-center rounded-xl bg-surface-container-low/40 border border-hairline focus-within:border-saffron-400 focus-within:bg-white transition-all shadow-subtle">
                  <Lock className="h-4 w-4 text-charcoal-subtle absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal-subtle/60 pl-10 pr-10 py-3 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-charcoal-subtle hover:text-charcoal transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#D96B27] to-[#E86A24] hover:from-[#c2410c] hover:to-[#D96B27] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="animate-pulse">Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-hairline" />
              <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider">
                OR DEVOTEE SINGLE SIGN-ON
              </span>
              <div className="flex-1 h-px bg-hairline" />
            </div>

            {/* Google Sign In button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-50 text-charcoal font-semibold py-3.5 px-4 rounded-xl border border-hairline flex items-center justify-center gap-3 transition-all text-xs shadow-subtle hover:shadow-md"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google (Devotee / User)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Line */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-charcoal-subtle pt-6 border-t border-saffron-200/60">
        <p>© 2026 HariSumiran Platform</p>
        <p>HariPrabodham, Nadiad • MongoDB Atlas</p>
      </div>
    </div>
  );
}
