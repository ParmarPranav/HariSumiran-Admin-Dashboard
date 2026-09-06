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
  User as UserIcon,
  Shield,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const { loginWithCredentials, setUser } = useApp();

  // Mode: "admin" or "user"
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");
  // User Mode: "login" or "register"
  const [userMode, setUserMode] = useState<"login" | "register">("login");

  // Form states - empty by default so credentials are never exposed on screen
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Registration states
  const [regName, setRegName] = useState("");
  const [regFamilyName, setRegFamilyName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleTabChange = (tab: "admin" | "user") => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
  };

  const handleLogin = async (e?: React.FormEvent) => {
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

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      toast.error("Please fill in all required registration fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: regName.trim(),
          familyName: regFamilyName.trim() || `${regName.trim()} Household`,
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: "family_captain",
          mandir: "HariPrabodham, Nadiad",
          familyId: data.user.familyId,
          familyName: data.user.familyName,
          isCaptain: true,
        });
        toast.success("Account Created Successfully!", {
          description: `Welcome ${data.user.name}! Your family profile has been registered.`,
        });
        router.push("/thal");
      } else {
        toast.error(data.error || "Registration failed.");
      }
    } catch (e: any) {
      setLoading(false);
      toast.error("Registration failed: " + e.message);
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
            Select your login persona to enter the workspace, manage daily Thal rotation schedules, family captain profiles, and temple operations.
          </p>
        </div>

        {/* Right Side: Tabbed Login Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white/95 border border-saffron-200/80 rounded-3xl p-6 sm:p-8 shadow-float space-y-6 backdrop-blur-xl">
            {/* Persona Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-surface-container-low border border-hairline">
              <button
                type="button"
                onClick={() => handleTabChange("admin")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "admin"
                    ? "bg-white text-primary-container shadow-subtle border border-saffron-200"
                    : "text-charcoal-subtle hover:text-charcoal"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Mandir Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("user")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "user"
                    ? "bg-white text-primary-container shadow-subtle border border-saffron-200"
                    : "text-charcoal-subtle hover:text-charcoal"
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>Devotee User</span>
              </button>
            </div>

            {/* ADMIN TAB */}
            {activeTab === "admin" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-charcoal block mb-1.5 uppercase">ADMIN EMAIL</label>
                  <div className="relative flex items-center rounded-xl bg-surface-container-low/40 border border-hairline focus-within:border-saffron-400 focus-within:bg-white transition-all shadow-subtle">
                    <Mail className="h-4 w-4 text-charcoal-subtle absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter admin email address..."
                      className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal-subtle/60 pl-10 pr-4 py-3 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal block mb-1.5 uppercase">ADMIN PASSWORD</label>
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#D96B27] to-[#E86A24] hover:from-[#c2410c] hover:to-[#D96B27] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="animate-pulse">Authenticating Admin...</span>
                  ) : (
                    <>
                      <span>Sign In as Mandir Administrator</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* DEVOTEE USER TAB */}
            {activeTab === "user" && (
              <div className="space-y-4">
                {/* Mode Sub-Toggle */}
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <span className="text-xs font-bold text-charcoal">Devotee Access</span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setUserMode("login")}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        userMode === "login"
                          ? "bg-saffron-100 text-saffron-900 font-bold"
                          : "text-charcoal-subtle hover:text-charcoal"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserMode("register")}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        userMode === "register"
                          ? "bg-saffron-100 text-saffron-900 font-bold"
                          : "text-charcoal-subtle hover:text-charcoal"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                {userMode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-charcoal block mb-1.5 uppercase">USER EMAIL</label>
                      <div className="relative flex items-center rounded-xl bg-surface-container-low/40 border border-hairline focus-within:border-saffron-400 focus-within:bg-white transition-all shadow-subtle">
                        <Mail className="h-4 w-4 text-charcoal-subtle absolute left-3.5 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter devotee email address..."
                          className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal-subtle/60 pl-10 pr-4 py-3 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-charcoal block mb-1.5 uppercase">PASSWORD</label>
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
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#D96B27] to-[#E86A24] hover:from-[#c2410c] hover:to-[#D96B27] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
                    >
                      {loading ? (
                        <span className="animate-pulse">Authenticating User...</span>
                      ) : (
                        <>
                          <span>Sign In as Devotee User</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-charcoal block mb-1 uppercase">FULL NAME *</label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Rameshbhai Patel"
                        className="w-full bg-surface-container-low/40 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-charcoal block mb-1 uppercase">HOUSEHOLD / PARIVAR NAME</label>
                      <input
                        type="text"
                        value={regFamilyName}
                        onChange={(e) => setRegFamilyName(e.target.value)}
                        placeholder="e.g. Patel Household (Rameshbhai)"
                        className="w-full bg-surface-container-low/40 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-charcoal block mb-1 uppercase">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. user369@gmail.com"
                        className="w-full bg-surface-container-low/40 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-charcoal block mb-1 uppercase">PASSWORD *</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full bg-surface-container-low/40 border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#D96B27] to-[#E86A24] hover:from-[#c2410c] hover:to-[#D96B27] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-md hover:shadow-lg disabled:opacity-50 mt-3"
                    >
                      {loading ? (
                        <span className="animate-pulse">Creating Account...</span>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Create Account &amp; Sign In</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
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
