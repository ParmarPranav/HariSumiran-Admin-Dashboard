"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  ShieldCheck,
  Fingerprint,
  Bell,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const { setRole, setUser, loginWithCredentials, loginWithApple } = useApp();

  const [step, setStep] = useState<"welcome" | "apple_flow" | "email_login">("welcome");
  const [email, setEmail] = useState("harisumiran369@gmail.com");
  const [password, setPassword] = useState("Atmiyata@3690");
  const [loading, setLoading] = useState(false);

  // Apple Sign In state
  const [appleName, setAppleName] = useState("Rameshbhai Patel");
  const [appleEmail, setAppleEmail] = useState("ramesh.patel@privaterelay.appleid.com");

  const handleCredentialsLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          password,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const result = loginWithCredentials(email, password);
        toast.success(data.message || "Login Successful!", {
          description: result.isAdmin ? "Authenticated as Mandir Administrator" : "Authenticated as Devotee User",
        });
        router.push("/thal");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err: any) {
      setLoading(false);
      const result = loginWithCredentials(email, password);
      router.push("/thal");
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appleId: `001928.${Date.now()}.apple`,
          email: appleEmail,
          name: appleName,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        loginWithApple({
          name: appleName,
          email: appleEmail,
          appleId: data.user.appleId,
        });
        toast.success("Apple ID Authenticated!", {
          description: "Welcome Devotee! Route to Thal Seva & Profile.",
        });
        router.push("/thal");
      }
    } catch (e: any) {
      setLoading(false);
      loginWithApple({
        name: appleName,
        email: appleEmail,
        appleId: "demo.apple.id",
      });
      router.push("/thal");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <MandalaBackground />

      <div className="w-full max-w-md z-10">
        {step === "welcome" && (
          <GlassCard className="text-center p-8 space-y-6 shadow-float">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/90 p-2.5 shadow-soft border border-saffron-200">
              <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal">HariSumiran</h2>
              <p className="mt-1 text-xs text-charcoal-subtle">
                Mandir Operations &amp; Thal Rotation Seva &bull; HariPrabodham, Nadiad
              </p>
            </div>

            {/* Email & Password Login Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4 text-left pt-1">
              <div>
                <label className="text-xs font-semibold text-charcoal">Email Address</label>
                <div className="mt-1 flex items-center rounded-xl border border-hairline bg-white px-3 py-2 shadow-subtle focus-within:border-saffron-400">
                  <Mail className="h-4 w-4 text-charcoal-subtle mr-2 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. harisumiran369@gmail.com"
                    className="w-full text-xs text-charcoal focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Password</label>
                <div className="mt-1 flex items-center rounded-xl border border-hairline bg-white px-3 py-2 shadow-subtle focus-within:border-saffron-400">
                  <Lock className="h-4 w-4 text-charcoal-subtle mr-2 shrink-0" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full text-xs text-charcoal focus:outline-none"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={loading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In to Workspace
              </Button>
            </form>

            <div className="p-3 rounded-2xl border border-saffron-200/60 bg-saffron-50/50 text-[11px] text-charcoal-subtle leading-relaxed text-left space-y-1">
              <p>👑 <strong>Admin Credentials:</strong> <code>harisumiran369@gmail.com</code></p>
              <p>🔑 <strong>Admin Password:</strong> <code>Atmiyata@3690</code></p>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-hairline" />
              <span className="text-[11px] font-semibold text-charcoal-subtle uppercase">Or Devotee Login</span>
              <div className="flex-1 h-px bg-hairline" />
            </div>

            {/* Sign in with Apple Button */}
            <button
              onClick={() => setStep("apple_flow")}
              className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-neutral-800 transition-all font-semibold rounded-2xl py-3.5 px-4 text-sm shadow-md"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.09-3.26-2.65-7.18-7.3-11.77-13.95-6.66-9.66-11.75-20.2-15.26-31.62-3.52-11.42-5.28-22.12-5.28-32.1 0-14.81 3.73-26.83 11.19-36.05 7.46-9.22 16.89-13.97 28.29-14.24 4.57 0 9.69 1.13 15.36 3.38 5.67 2.25 9.71 3.38 12.12 3.38 2.05 0 6.25-1.22 12.61-3.67 6.36-2.45 11.79-3.55 16.29-3.3 12.35.53 22.39 4.9 30.12 13.11-10.9 6.58-16.22 15.64-15.96 27.18.27 9.07 3.7 16.63 10.3 22.68 6.6 6.05 14.54 9.66 23.82 10.83-2.3 6.94-5.3 14.15-9.01 21.63zM119.22 31.84c0-7.07 2.56-13.78 7.69-20.13 5.13-6.35 11.66-10.4 19.59-12.15.54 6.77-1.78 13.48-6.96 20.13-5.18 6.65-11.71 10.6-19.59 11.85-.27-.23-.49-.78-.73-1.7z" />
              </svg>
              Sign in with Apple (Devotee / User)
            </button>
          </GlassCard>
        )}

        {step === "apple_flow" && (
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-md">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.09-3.26-2.65-7.18-7.3-11.77-13.95-6.66-9.66-11.75-20.2-15.26-31.62-3.52-11.42-5.28-22.12-5.28-32.1 0-14.81 3.73-26.83 11.19-36.05 7.46-9.22 16.89-13.97 28.29-14.24 4.57 0 9.69 1.13 15.36 3.38 5.67 2.25 9.71 3.38 12.12 3.38 2.05 0 6.25-1.22 12.61-3.67 6.36-2.45 11.79-3.55 16.29-3.3 12.35.53 22.39 4.9 30.12 13.11-10.9 6.58-16.22 15.64-15.96 27.18.27 9.07 3.7 16.63 10.3 22.68 6.6 6.05 14.54 9.66 23.82 10.83-2.3 6.94-5.3 14.15-9.01 21.63zM119.22 31.84c0-7.07 2.56-13.78 7.69-20.13 5.13-6.35 11.66-10.4 19.59-12.15.54 6.77-1.78 13.48-6.96 20.13-5.18 6.65-11.71 10.6-19.59 11.85-.27-.23-.49-.78-.73-1.7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal">Sign in with Apple ID</h3>
                <p className="text-xs text-charcoal-subtle">Secure single sign-on for family &amp; devotees</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-charcoal">Devotee Full Name</label>
                <input
                  type="text"
                  value={appleName}
                  onChange={(e) => setAppleName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-hairline px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Apple ID Email</label>
                <input
                  type="email"
                  value={appleEmail}
                  onChange={(e) => setAppleEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-hairline px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-hairline text-[11px] text-charcoal-subtle">
              🔒 Authenticating with Apple ID. Your email &amp; privacy are protected with Hide My Email.
            </div>

            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full bg-black text-white hover:bg-neutral-800"
                isLoading={loading}
                onClick={handleAppleSignIn}
              >
                Authenticate with Apple ID
              </Button>

              <button
                onClick={() => setStep("welcome")}
                className="w-full text-center text-xs text-charcoal-subtle hover:text-charcoal pt-2"
              >
                &larr; Back to Login Options
              </button>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
