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
  const { setRole, setUser } = useApp();

  const [step, setStep] = useState<"welcome" | "login" | "otp" | "device_trust" | "role_onboarding">("welcome");
  const [phone, setPhone] = useState("9825023456");
  const [otp, setOtp] = useState(["1", "2", "3", "4", "5", "6"]);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!phone) {
      toast.error("Please enter a mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      toast.success("OTP Sent", { description: "Use demo code: 123456" });
    }, 500);
  };

  const handleVerifyOtp = () => {
    const entered = otp.join("");
    if (entered !== "123456") {
      toast.error("Invalid OTP", { description: "Please enter demo code: 123456" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("device_trust");
    }, 500);
  };

  const handleCompleteOnboarding = () => {
    toast.success("Welcome to HariSumiran", {
      description: "Authenticated for HariPrabodham, Nadiad.",
    });
    router.push("/");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <MandalaBackground />

      <div className="w-full max-w-md z-10">
        {step === "welcome" && (
          <GlassCard className="text-center p-8 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-saffron-50 text-primary-container font-heading font-extrabold text-3xl shadow-soft border border-saffron-200">
              હ
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal">HariSumiran</h2>
              <p className="mt-1 text-xs text-charcoal-subtle">
                Authenticated Seva & Temple Operations &bull; HariPrabodham, Nadiad
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-hairline bg-surface-container-low/50 text-xs text-charcoal-subtle leading-relaxed">
              &ldquo;Your seva, organized with care and devotion.&rdquo;
            </div>

            <div className="space-y-2.5 pt-2">
              <Button
                size="lg"
                className="w-full"
                onClick={() => setStep("login")}
                leftIcon={<Phone className="h-4 w-4" />}
              >
                Continue with Mobile Number
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setStep("login")}
                leftIcon={<Mail className="h-4 w-4" />}
              >
                Continue with Email
              </Button>
            </div>
          </GlassCard>
        )}

        {step === "login" && (
          <GlassCard className="p-8 space-y-6">
            <div>
              <h3 className="font-heading text-xl font-bold text-charcoal">Enter Mobile Number</h3>
              <p className="mt-1 text-xs text-charcoal-subtle">
                We will send a 6-digit authentication code to verify your access.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Mobile Number (+91)</label>
              <div className="mt-1.5 flex rounded-xl border border-hairline bg-white shadow-subtle overflow-hidden focus-within:border-saffron-400">
                <span className="flex items-center px-3.5 bg-surface-container-low text-xs font-semibold text-charcoal-subtle border-r border-hairline">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98250 23456"
                  className="flex-1 px-3.5 py-2.5 text-sm text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full"
                isLoading={loading}
                onClick={handleSendOtp}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Send 6-Digit OTP
              </Button>
              <button
                onClick={() => setStep("welcome")}
                className="w-full text-center text-xs text-charcoal-subtle hover:text-charcoal pt-2"
              >
                &larr; Back to Welcome
              </button>
            </div>
          </GlassCard>
        )}

        {step === "otp" && (
          <GlassCard className="p-8 space-y-6 text-center">
            <div>
              <h3 className="font-heading text-xl font-bold text-charcoal">Verify Code</h3>
              <p className="mt-1 text-xs text-charcoal-subtle">
                Enter code sent to <strong>+91 {phone}</strong>
              </p>
            </div>

            {/* 6-Digit OTP inputs */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value;
                    setOtp(newOtp);
                  }}
                  className="h-12 w-12 text-center font-heading text-lg font-bold text-charcoal rounded-xl border border-hairline bg-white shadow-subtle focus:border-saffron-400 focus:outline-none"
                />
              ))}
            </div>

            <p className="text-[11px] text-charcoal-subtle">
              Demo OTP Code: <strong className="text-primary-container">123456</strong>
            </p>

            <div className="space-y-2 pt-2">
              <Button
                size="lg"
                className="w-full"
                isLoading={loading}
                onClick={handleVerifyOtp}
              >
                Verify &amp; Continue
              </Button>
              <button
                onClick={() => toast.info("OTP Resent to " + phone)}
                className="w-full text-center text-xs text-primary-container font-semibold hover:underline"
              >
                Resend Code (30s)
              </button>
            </div>
          </GlassCard>
        )}

        {step === "device_trust" && (
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-secondary border border-emerald-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal">Device Trust &amp; Biometrics</h3>
                <p className="text-xs text-charcoal-subtle">Secure your daily temple access</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-hairline bg-surface-container-low/40 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary-container" />
                  <div>
                    <p className="text-xs font-bold text-charcoal">Enable Biometric Re-entry</p>
                    <p className="text-[11px] text-charcoal-subtle">Instant login via Touch ID / Face ID</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={biometricsEnabled}
                  onChange={(e) => setBiometricsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded text-primary-container focus:ring-saffron-400"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-hairline bg-surface-container-low/40 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-xs font-bold text-charcoal">Remember Device (30 Days)</p>
                    <p className="text-[11px] text-charcoal-subtle">Fewer OTP prompts on this browser</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 rounded text-primary-container focus:ring-saffron-400"
                />
              </label>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => setStep("role_onboarding")}
            >
              Continue
            </Button>
          </GlassCard>
        )}

        {step === "role_onboarding" && (
          <GlassCard className="p-8 space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-secondary border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-charcoal">Verified Role Detected</h3>
              <p className="mt-1 text-xs text-charcoal-subtle">
                You have been authenticated as <strong>Mandir Administrator</strong> for HariPrabodham, Nadiad.
              </p>
            </div>

            <div className="text-left p-4 rounded-2xl border border-hairline bg-surface-container-low/50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-subtle">Full Name:</span>
                <span className="font-bold text-charcoal">Nitinbhai Patel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-subtle">Role:</span>
                <span className="font-bold text-primary-container">Mandir Administrator</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-subtle">Assigned Mandir:</span>
                <span className="font-bold text-charcoal">HariPrabodham, Nadiad</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleCompleteOnboarding}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Enter HariSumiran Workspace
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
