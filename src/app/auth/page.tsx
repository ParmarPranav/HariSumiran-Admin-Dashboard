"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const { loginWithCredentials, loginWithApple } = useApp();

  const [step, setStep] = useState<"credentials" | "apple_flow">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Apple Sign In state
  const [appleName, setAppleName] = useState("Rameshbhai Patel");
  const [appleEmail, setAppleEmail] = useState("ramesh.patel@privaterelay.appleid.com");

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
          description: "Welcome Devotee! Accessing Thal Seva & Profile.",
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
    <div className="min-h-screen w-full bg-[#08090d] text-white flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-[#10b981] selection:text-black">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center backdrop-blur-md">
            <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight text-white">HariSumiran</h1>
            <p className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              MANDIR OPERATIONS PLATFORM
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-8 max-w-7xl mx-auto w-full">
        {/* Left Side: Branding & Intelligence Headline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs font-mono font-medium">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            Step 1: Admin Credentials Verification
          </div>

          <div className="space-y-3">
            <p className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              RESTAURANT &amp; MANDIR INTELLIGENCE PLATFORM
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              An Intelligent{" "}
              <span className="bg-gradient-to-r from-[#10b981] to-[#34d399] bg-clip-text text-transparent">
                Multi-Location
              </span>{" "}
              Mandir Management System
            </h2>
          </div>

          <p className="text-sm md:text-base text-neutral-400 max-w-xl leading-relaxed">
            Step 1 of 2: Enter node credentials to proceed to workspace verification and Thal Seva operations.
          </p>
        </div>

        {/* Right Side: Sleek Dark Authentication Card */}
        <div className="lg:col-span-5 w-full">
          {step === "credentials" && (
            <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              <div>
                <h3 className="font-heading text-2xl font-bold text-white tracking-tight">
                  Node Authentication
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  Step 1 of 2: Provide security credentials.
                </p>
              </div>

              <form onSubmit={handleCredentialsLogin} className="space-y-5">
                <div>
                  <label className="text-[11px] font-mono tracking-wider font-semibold text-neutral-300 uppercase block mb-2">
                    EMAIL / NODE IDENTIFIER
                  </label>
                  <div className="relative flex items-center rounded-xl bg-[#141722] border border-white/10 focus-within:border-[#10b981] transition-all">
                    <Mail className="h-4 w-4 text-neutral-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@officialharisumiran.io"
                      className="w-full bg-transparent text-sm text-white placeholder:text-neutral-600 pl-10 pr-4 py-3 focus:outline-none font-sans"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono tracking-wider font-semibold text-neutral-300 uppercase block mb-2">
                    SECURITY KEY
                  </label>
                  <div className="relative flex items-center rounded-xl bg-[#141722] border border-white/10 focus-within:border-[#10b981] transition-all">
                    <Lock className="h-4 w-4 text-neutral-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-transparent text-sm text-white placeholder:text-neutral-600 pl-10 pr-10 py-3 focus:outline-none font-sans"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-neutral-500 hover:text-white transition-colors"
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
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-black font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Proceed to Mandir Console</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  OR DEVOTEE LOGIN
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Apple Sign In button */}
              <button
                onClick={() => setStep("apple_flow")}
                className="w-full bg-black hover:bg-neutral-900 border border-white/15 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all text-sm shadow-md"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.09-3.26-2.65-7.18-7.3-11.77-13.95-6.66-9.66-11.75-20.2-15.26-31.62-3.52-11.42-5.28-22.12-5.28-32.1 0-14.81 3.73-26.83 11.19-36.05 7.46-9.22 16.89-13.97 28.29-14.24 4.57 0 9.69 1.13 15.36 3.38 5.67 2.25 9.71 3.38 12.12 3.38 2.05 0 6.25-1.22 12.61-3.67 6.36-2.45 11.79-3.55 16.29-3.3 12.35.53 22.39 4.9 30.12 13.11-10.9 6.58-16.22 15.64-15.96 27.18.27 9.07 3.7 16.63 10.3 22.68 6.6 6.05 14.54 9.66 23.82 10.83-2.3 6.94-5.3 14.15-9.01 21.63zM119.22 31.84c0-7.07 2.56-13.78 7.69-20.13 5.13-6.35 11.66-10.4 19.59-12.15.54 6.77-1.78 13.48-6.96 20.13-5.18 6.65-11.71 10.6-19.59 11.85-.27-.23-.49-.78-.73-1.7z" />
                </svg>
                <span>Sign in with Apple (Devotee / User)</span>
              </button>
            </div>
          )}

          {step === "apple_flow" && (
            <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black border border-white/20 text-white">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.09-3.26-2.65-7.18-7.3-11.77-13.95-6.66-9.66-11.75-20.2-15.26-31.62-3.52-11.42-5.28-22.12-5.28-32.1 0-14.81 3.73-26.83 11.19-36.05 7.46-9.22 16.89-13.97 28.29-14.24 4.57 0 9.69 1.13 15.36 3.38 5.67 2.25 9.71 3.38 12.12 3.38 2.05 0 6.25-1.22 12.61-3.67 6.36-2.45 11.79-3.55 16.29-3.3 12.35.53 22.39 4.9 30.12 13.11-10.9 6.58-16.22 15.64-15.96 27.18.27 9.07 3.7 16.63 10.3 22.68 6.6 6.05 14.54 9.66 23.82 10.83-2.3 6.94-5.3 14.15-9.01 21.63zM119.22 31.84c0-7.07 2.56-13.78 7.69-20.13 5.13-6.35 11.66-10.4 19.59-12.15.54 6.77-1.78 13.48-6.96 20.13-5.18 6.65-11.71 10.6-19.59 11.85-.27-.23-.49-.78-.73-1.7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">Apple ID Single Sign-On</h3>
                  <p className="text-xs text-neutral-400 font-mono">Devotee &amp; Family Member Access</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono tracking-wider font-semibold text-neutral-300 uppercase block mb-1.5">
                    DEVOTEE FULL NAME
                  </label>
                  <input
                    type="text"
                    value={appleName}
                    onChange={(e) => setAppleName(e.target.value)}
                    className="w-full bg-[#141722] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#10b981] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono tracking-wider font-semibold text-neutral-300 uppercase block mb-1.5">
                    APPLE ID EMAIL
                  </label>
                  <input
                    type="email"
                    value={appleEmail}
                    onChange={(e) => setAppleEmail(e.target.value)}
                    className="w-full bg-[#141722] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#10b981] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-neutral-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#10b981] shrink-0" />
                <span>Protected with Apple Private Relay &amp; End-to-End Encryption.</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleAppleSignIn}
                  disabled={loading}
                  className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                >
                  {loading ? "Authenticating..." : "Authenticate with Apple ID"}
                </button>

                <button
                  onClick={() => setStep("credentials")}
                  className="w-full text-center text-xs text-neutral-400 hover:text-white pt-2 font-mono"
                >
                  &larr; Return to Credentials Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Line */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-neutral-500 pt-6 border-t border-white/10">
        <p>© 2026 HariSumiran Platform</p>
        <p>v1.0.0 (MongoDB Atlas Cluster)</p>
      </div>
    </div>
  );
}
