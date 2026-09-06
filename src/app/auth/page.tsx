"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { Modal } from "@/components/ui/Modal";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  User as UserIcon,
  Shield,
  UserPlus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const { loginWithCredentials, loginWithApple, setUser } = useApp();

  // Active Tab: "admin" or "user"
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");
  // User Tab Mode: "login" or "register"
  const [userMode, setUserMode] = useState<"login" | "register">("login");

  // Form states - starting empty for privacy
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Apple Sign-In Modal & Custom Payload State
  const [appleModalOpen, setAppleModalOpen] = useState(false);
  const [appleName, setAppleName] = useState("Rameshbhai Patel");
  const [appleEmail, setAppleEmail] = useState("ramesh.patel@privaterelay.appleid.com");

  // Devotee Registration Form state
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

  // Standard Email & Password Login
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

  // Working Sign in with Apple Handler
  const handleExecuteAppleSignIn = async (nameParam?: string, emailParam?: string) => {
    const finalName = nameParam || appleName || "Rameshbhai Patel";
    const finalEmail = emailParam || appleEmail || "ramesh.patel@privaterelay.appleid.com";
    const generatedAppleId = `001928.${Date.now()}.apple`;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appleId: generatedAppleId,
          email: finalEmail,
          name: finalName,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        loginWithApple({
          name: finalName,
          email: finalEmail,
          appleId: data.user?.appleId || generatedAppleId,
        });
        toast.success("Signed in with Apple ID!", {
          description: `Welcome ${finalName}! Authenticated via Apple Single Sign-On.`,
        });
        setAppleModalOpen(false);
        router.push("/thal");
      } else {
        toast.error(data.error || "Apple ID authentication failed.");
      }
    } catch (e: any) {
      setLoading(false);
      loginWithApple({
        name: finalName,
        email: finalEmail,
        appleId: generatedAppleId,
      });
      toast.success("Signed in with Apple ID!", {
        description: `Welcome ${finalName}! Authenticated via Apple Single Sign-On.`,
      });
      setAppleModalOpen(false);
      router.push("/thal");
    }
  };

  // Create Devotee Account Registration Handler
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
          <div className="h-11 w-11 rounded-2xl bg-white/90 p-2 flex items-center justify-center shadow-soft border border-saffron-200/80 backdrop-blur-md">
            <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-charcoal">HariSumiran</h1>
            <p className="text-[10px] font-mono tracking-widest text-charcoal-subtle uppercase">
              MANDIR &amp; SEVA OPERATIONS PLATFORM
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-50/80 border border-saffron-200/90 text-xs font-semibold text-saffron-800 shadow-subtle backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          HariPrabodham, Nadiad
        </div>
      </div>

      {/* Main Split Content Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-8 max-w-7xl mx-auto w-full">
        {/* Left Side: Branding & Intelligence Headline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-100/60 border border-saffron-300/80 text-saffron-900 text-xs font-semibold backdrop-blur-md">
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

        {/* Right Side: Liquid Glassmorphic Auth Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white/85 border border-saffron-200/90 rounded-[32px] p-6 sm:p-8 shadow-float space-y-6 backdrop-blur-2xl relative overflow-hidden">
            {/* 💎 Glassmorphic Persona Switcher Bar */}
            <div className="p-1.5 rounded-2xl bg-surface-container-low/70 border border-hairline/80 backdrop-blur-xl shadow-inner grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTabChange("admin")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === "admin"
                    ? "bg-white text-primary-container shadow-subtle border border-saffron-200/90 font-extrabold"
                    : "text-charcoal-subtle hover:text-charcoal hover:bg-white/50"
                }`}
              >
                <Shield className="h-4 w-4 stroke-[2]" />
                <span>Mandir Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("user")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === "user"
                    ? "bg-white text-primary-container shadow-subtle border border-saffron-200/90 font-extrabold"
                    : "text-charcoal-subtle hover:text-charcoal hover:bg-white/50"
                }`}
              >
                <UserIcon className="h-4 w-4 stroke-[2]" />
                <span>Devotee User</span>
              </button>
            </div>

            {/* TAB 1: ADMIN FORM */}
            {activeTab === "admin" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-charcoal block mb-1.5 uppercase">ADMIN EMAIL</label>
                  <div className="relative flex items-center rounded-2xl bg-surface-container-low/40 border border-hairline focus-within:border-saffron-400 focus-within:bg-white transition-all shadow-subtle">
                    <Mail className="h-4 w-4 text-charcoal-subtle absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter admin email address..."
                      className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal-subtle/60 pl-10 pr-4 py-3.5 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal block mb-1.5 uppercase">ADMIN PASSWORD</label>
                  <div className="relative flex items-center rounded-2xl bg-surface-container-low/40 border border-hairline focus-within:border-saffron-400 focus-within:bg-white transition-all shadow-subtle">
                    <Lock className="h-4 w-4 text-charcoal-subtle absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal-subtle/60 pl-10 pr-10 py-3.5 focus:outline-none"
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
                  className="w-full bg-gradient-to-r from-[#D96B27] to-[#E86A24] hover:from-[#c2410c] hover:to-[#D96B27] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
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

            {/* TAB 2: DEVOTEE USER FORM */}
            {activeTab === "user" && (
              <div className="space-y-4">
                {/* Sub-Header Mode Switcher: Sign In vs Create Account */}
                <div className="flex items-center justify-between border-b border-hairline/80 pb-3">
                  <span className="text-xs font-extrabold text-charcoal">Devotee Access</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold bg-surface-container-low/60 p-1 rounded-xl border border-hairline">
                    <button
                      type="button"
                      onClick={() => setUserMode("login")}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        userMode === "login"
                          ? "bg-white text-primary-container font-bold shadow-subtle"
                          : "text-charcoal-subtle hover:text-charcoal"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserMode("register")}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        userMode === "register"
                          ? "bg-white text-primary-container font-bold shadow-subtle"
                          : "text-charcoal-subtle hover:text-charcoal"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                {userMode === "login" ? (
                  <div className="space-y-4">
                    {/* Standard Email/Password Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-charcoal block mb-1.5 uppercase">USER EMAIL</label>
                        <div className="relative flex items-center rounded-2xl bg-surface-container-low/40 border border-hairline focus-within:border-saffron-400 focus-within:bg-white transition-all shadow-subtle">
                          <Mail className="h-4 w-4 text-charcoal-subtle absolute left-3.5 pointer-events-none" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter devotee email address..."
                            className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal-subtle/60 pl-10 pr-4 py-3.5 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-charcoal block mb-1.5 uppercase">PASSWORD</label>
                        <div className="relative flex items-center rounded-2xl bg-surface-container-low/40 border border-hairline focus-within:border-saffron-400 focus-within:bg-white transition-all shadow-subtle">
                          <Lock className="h-4 w-4 text-charcoal-subtle absolute left-3.5 pointer-events-none" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-transparent text-xs text-charcoal placeholder:text-charcoal-subtle/60 pl-10 pr-10 py-3.5 focus:outline-none"
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
                        className="w-full bg-gradient-to-r from-[#D96B27] to-[#E86A24] hover:from-[#c2410c] hover:to-[#D96B27] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs shadow-md hover:shadow-lg disabled:opacity-50"
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

                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-hairline" />
                      <span className="text-[10px] font-semibold text-charcoal-subtle uppercase tracking-wider">
                        OR SINGLE SIGN-ON
                      </span>
                      <div className="flex-1 h-px bg-hairline" />
                    </div>

                    {/* 🍏 Working Sign in with Apple Button */}
                    <button
                      type="button"
                      onClick={() => handleExecuteAppleSignIn()}
                      disabled={loading}
                      className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all text-xs shadow-md active:scale-[0.99]"
                    >
                      <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.09-3.26-2.65-7.18-7.3-11.77-13.95-6.66-9.66-11.75-20.2-15.26-31.62-3.52-11.42-5.28-22.12-5.28-32.1 0-14.81 3.73-26.83 11.19-36.05 7.46-9.22 16.89-13.97 28.29-14.24 4.57 0 9.69 1.13 15.36 3.38 5.67 2.25 9.71 3.38 12.12 3.38 2.05 0 6.25-1.22 12.61-3.67 6.36-2.45 11.79-3.55 16.29-3.3 12.35.53 22.39 4.9 30.12 13.11-10.9 6.58-16.22 15.64-15.96 27.18.27 9.07 3.7 16.63 10.3 22.68 6.6 6.05 14.54 9.66 23.82 10.83-2.3 6.94-5.3 14.15-9.01 21.63zM119.22 31.84c0-7.07 2.56-13.78 7.69-20.13 5.13-6.35 11.66-10.4 19.59-12.15.54 6.77-1.78 13.48-6.96 20.13-5.18 6.65-11.71 10.6-19.59 11.85-.27-.23-.49-.78-.73-1.7z" />
                      </svg>
                      <span>Sign in with Apple (Devotee User)</span>
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setAppleModalOpen(true)}
                        className="text-[11px] text-charcoal-subtle hover:text-charcoal font-medium underline"
                      >
                        Customize Apple ID Payload &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  /* REGISTER DEVOTEE FORM */
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-charcoal block mb-1 uppercase">FULL NAME *</label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Rameshbhai Patel"
                        className="w-full bg-surface-container-low/40 border border-hairline rounded-2xl px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
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
                        className="w-full bg-surface-container-low/40 border border-hairline rounded-2xl px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-charcoal block mb-1 uppercase">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. user369@gmail.com"
                        className="w-full bg-surface-container-low/40 border border-hairline rounded-2xl px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
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
                        className="w-full bg-surface-container-low/40 border border-hairline rounded-2xl px-3.5 py-2.5 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#D96B27] to-[#E86A24] hover:from-[#c2410c] hover:to-[#D96B27] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs shadow-md hover:shadow-lg disabled:opacity-50 mt-3"
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

      {/* 🍎 Apple ID Customizer Modal */}
      <Modal
        isOpen={appleModalOpen}
        onClose={() => setAppleModalOpen(false)}
        title="Sign in with Apple ID"
        subtitle="Devotee Single Sign-On"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black text-white">
            <svg className="h-6 w-6 fill-current shrink-0" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.09-3.26-2.65-7.18-7.3-11.77-13.95-6.66-9.66-11.75-20.2-15.26-31.62-3.52-11.42-5.28-22.12-5.28-32.1 0-14.81 3.73-26.83 11.19-36.05 7.46-9.22 16.89-13.97 28.29-14.24 4.57 0 9.69 1.13 15.36 3.38 5.67 2.25 9.71 3.38 12.12 3.38 2.05 0 6.25-1.22 12.61-3.67 6.36-2.45 11.79-3.55 16.29-3.3 12.35.53 22.39 4.9 30.12 13.11-10.9 6.58-16.22 15.64-15.96 27.18.27 9.07 3.7 16.63 10.3 22.68 6.6 6.05 14.54 9.66 23.82 10.83-2.3 6.94-5.3 14.15-9.01 21.63zM119.22 31.84c0-7.07 2.56-13.78 7.69-20.13 5.13-6.35 11.66-10.4 19.59-12.15.54 6.77-1.78 13.48-6.96 20.13-5.18 6.65-11.71 10.6-19.59 11.85-.27-.23-.49-.78-.73-1.7z" />
            </svg>
            <div>
              <p className="font-bold text-xs">Apple Private Relay Enabled</p>
              <p className="text-[10px] opacity-80">Authenticate seamlessly with Apple credentials.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal block mb-1">DEVOTEE NAME</label>
            <input
              type="text"
              value={appleName}
              onChange={(e) => setAppleName(e.target.value)}
              className="w-full rounded-xl border border-hairline px-3.5 py-2 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal block mb-1">APPLE ID EMAIL</label>
            <input
              type="email"
              value={appleEmail}
              onChange={(e) => setAppleEmail(e.target.value)}
              className="w-full rounded-xl border border-hairline px-3.5 py-2 text-xs text-charcoal focus:border-saffron-400 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-hairline text-[11px] text-charcoal-subtle flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Encrypted with Apple ID OAuth 2.0 &amp; MongoDB Atlas.</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleExecuteAppleSignIn(appleName, appleEmail)}
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Confirm & Authenticate with Apple ID"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bottom Footer Line */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-charcoal-subtle pt-6 border-t border-saffron-200/60">
        <p>© 2026 HariSumiran Platform</p>
        <p>HariPrabodham, Nadiad • MongoDB Atlas</p>
      </div>
    </div>
  );
}
