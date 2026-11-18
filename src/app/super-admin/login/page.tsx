"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
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
  Smartphone,
  QrCode,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  LifeBuoy,
  Clock,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DEFAULT_SUPERADMIN_EMAIL = "hpsuperadmin@gmail.com";
const DEFAULT_SUPERADMIN_PASS = "HP@Super#Admin@1809";
const SETUP_SECRET_KEY = "HARISUMIRANROOTMANDIRADMIN234567";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { loginSuperAdmin, isSuperAdmin, user, language } = useApp();

  // Login Form States
  const [email, setEmail] = useState(DEFAULT_SUPERADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_SUPERADMIN_PASS);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA Multi-Factor States
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [tempSessionToken, setTempSessionToken] = useState<string>("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 30-Second TOTP Window Live Countdown
  useEffect(() => {
    const updateCountdown = () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const remaining = 30 - (nowSeconds % 30);
      setSecondsRemaining(remaining);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // If already logged in as super admin, redirect to console
  useEffect(() => {
    if (isSuperAdmin && user?.email === DEFAULT_SUPERADMIN_EMAIL) {
      router.push("/super-admin");
    }
  }, [isSuperAdmin, user, router]);

  // Focus first digit when switching to 2FA step
  useEffect(() => {
    if (step === "2fa" && !isUsingRecoveryCode) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step, isUsingRecoveryCode]);

  // Handle Stage 1: Primary Credentials Submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both Super Admin ID and Password");
      return;
    }

    setLoading(true);
    const result = await loginSuperAdmin(email.trim(), password.trim());
    setLoading(false);

    if (result.require2FA) {
      setTempSessionToken(result.tempSessionToken || "");
      setStep("2fa");
      toast.info("Google Authenticator Required", {
        description: "Please enter the 6-digit verification code from your phone.",
      });
    } else if (result.success) {
      router.push("/super-admin");
    }
  };

  // Handle Stage 2: 2FA Verification Submission
  const handleVerify2FA = async (codeToVerify?: string) => {
    const code = codeToVerify || (isUsingRecoveryCode ? recoveryCode.trim() : otpDigits.join(""));

    if (isUsingRecoveryCode) {
      if (!recoveryCode.trim()) {
        toast.error("Please enter your emergency recovery code");
        return;
      }
    } else {
      if (code.length !== 6) {
        toast.error("Please enter all 6 digits of your Google Authenticator code");
        return;
      }
    }

    setLoading(true);
    const result = await loginSuperAdmin(
      email.trim(),
      password.trim(),
      !isUsingRecoveryCode ? code : undefined,
      isUsingRecoveryCode ? recoveryCode.trim() : undefined,
      tempSessionToken
    );
    setLoading(false);

    if (result.success) {
      router.push("/super-admin");
    } else if (result.error) {
      // Clear digits on failure
      if (!isUsingRecoveryCode) {
        setOtpDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    }
  };

  // 6-Digit OTP Box Handlers
  const handleDigitChange = (index: number, value: string) => {
    // Handle paste of full 6-digit code
    if (value.length > 1) {
      const numbers = value.replace(/\D/g, "").slice(0, 6).split("");
      if (numbers.length > 0) {
        const newDigits = [...otpDigits];
        numbers.forEach((num, i) => {
          if (index + i < 6) newDigits[index + i] = num;
        });
        setOtpDigits(newDigits);
        const nextFocus = Math.min(index + numbers.length, 5);
        inputRefs.current[nextFocus]?.focus();

        if (newDigits.every((d) => d.length === 1)) {
          handleVerify2FA(newDigits.join(""));
        }
      }
      return;
    }

    const cleanChar = value.replace(/\D/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto-advance to next box
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (cleanChar && index === 5 && newDigits.every((d) => d.length === 1)) {
      handleVerify2FA(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleQuickFill = () => {
    setEmail(DEFAULT_SUPERADMIN_EMAIL);
    setPassword(DEFAULT_SUPERADMIN_PASS);
    toast.success("Credentials populated", {
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
          <AnimatePresence mode="wait">
            {step === "credentials" ? (
              /* ======================================================== */
              /* STAGE 1: PRIMARY CREDENTIALS (Email & Password)         */
              /* ======================================================== */
              <motion.div
                key="credentials"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
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
                      Sign in with your master credentials and Google Authenticator 2FA.
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
                <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
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
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Continue to 2FA Verification
                    </Button>
                  </div>
                </form>

                {/* Security Notice Footer */}
                <div className="pt-2 border-t border-stone-100 text-center">
                  <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Enforced by Google Authenticator (RFC 6238 TOTP)
                  </p>
                </div>
              </motion.div>
            ) : (
              /* ======================================================== */
              /* STAGE 2: GOOGLE AUTHENTICATOR (6-Digit TOTP / Recovery) */
              /* ======================================================== */
              <motion.div
                key="2fa"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* 2FA Header */}
                <div className="text-center space-y-2">
                  <div className="mx-auto h-14 w-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs relative">
                    <Smartphone className="h-7 w-7" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      2F
                    </span>
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider mb-1">
                      Secondary Factor Active
                    </span>
                    <h2 className="font-heading text-xl font-bold text-stone-900">
                      Two-Factor Authentication
                    </h2>
                    <p className="text-xs text-stone-600 mt-1">
                      Enter the 6-digit verification code from your <strong>Google Authenticator</strong> app.
                    </p>
                  </div>
                </div>

                {!isUsingRecoveryCode ? (
                  /* Standard 6-Digit OTP Box Grid */
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            inputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="h-12 w-11 sm:h-14 sm:w-12 text-center text-xl font-mono font-black rounded-2xl border-2 border-stone-200 bg-stone-50 text-stone-900 focus:border-amber-500 focus:bg-white focus:outline-hidden transition-all shadow-xs"
                        />
                      ))}
                    </div>

                    {/* Live TOTP 30-Second Refresh Meter */}
                    <div className="flex items-center justify-between px-2 text-[11px] font-mono text-stone-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>Code refreshes in:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-700">{secondsRemaining}s</span>
                        <div className="h-1.5 w-12 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                            className="h-full bg-amber-500 transition-all duration-1000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Emergency Break-Glass Recovery Code Input */
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-700 block">
                      Emergency Recovery Code
                    </label>
                    <input
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="e.g. 34AA-5F87"
                      className="w-full px-4 py-3 rounded-2xl border border-stone-300 font-mono text-sm tracking-widest text-center font-bold text-stone-900 focus:border-amber-500 focus:outline-hidden shadow-xs"
                    />
                    <p className="text-[11px] text-stone-500">
                      Enter one of your 8 single-use break-glass codes. This code will be burned upon successful login.
                    </p>
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => handleVerify2FA()}
                  isLoading={loading}
                  className="w-full justify-center shadow-md shadow-amber-600/20"
                >
                  Verify &amp; Enter Console
                </Button>

                {/* Fallbacks & Navigation */}
                <div className="space-y-2.5 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUsingRecoveryCode(!isUsingRecoveryCode);
                        setOtpDigits(["", "", "", "", "", ""]);
                      }}
                      className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1"
                    >
                      <LifeBuoy className="h-3.5 w-3.5 text-amber-600" />
                      <span>{isUsingRecoveryCode ? "Use 6-Digit Authenticator" : "Use Recovery Code"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="text-stone-500 hover:text-stone-800 font-semibold flex items-center gap-1"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>View Setup Key</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setOtpDigits(["", "", "", "", "", ""]);
                    }}
                    className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Password</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto text-center py-4 text-[11px] text-stone-500">
        HariSumiran Enterprise Node • HariPrabodham, Nadiad • Super Administration Portal
      </footer>

      {/* QR Code Setup Modal for Admin Reference */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-stone-200"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-stone-900">
                      Google Authenticator Key
                    </h3>
                    <p className="text-[11px] text-stone-500">hpsuperadmin@gmail.com</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              </div>

              <div className="text-center space-y-3">
                <div className="p-4 bg-white rounded-2xl border border-stone-200 inline-block shadow-xs">
                  <img
                    src="/super_admin_2fa_qr.png"
                    alt="Google Authenticator QR Code"
                    className="h-44 w-44 mx-auto rounded-lg object-contain bg-white"
                  />
                  <p className="text-[11px] font-bold text-stone-800 mt-2">Scan in Google Authenticator</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left">
                  <p className="text-[11px] font-bold text-stone-700">Or Manual Setup Key:</p>
                  <code className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded block mt-1 select-all break-all border border-amber-200">
                    {SETUP_SECRET_KEY}
                  </code>
                </div>

                <p className="text-[11px] text-stone-500 leading-snug">
                  Open Google Authenticator &rarr; tap <strong>+</strong> &rarr; select <strong>Scan a QR code</strong> or <strong>Enter a setup key</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
