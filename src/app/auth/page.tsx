"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { Modal } from "@/components/ui/Modal";
import {
  Lock,
  Fingerprint,
  ScanFace,
  Delete,
  ShieldCheck,
  Languages,
  CheckCircle2,
  Sparkles,
  Users,
  Shield,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { initialUsers } from "@/lib/seedData";

export default function AuthPage() {
  const router = useRouter();
  const {
    user,
    unlockWithPin,
    unlockWithBiometrics,
    switchPersona,
    setupPin,
    language,
    setLanguage,
    t,
  } = useApp();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [personaModalOpen, setPersonaModalOpen] = useState(false);

  // Handle number pad button click
  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPinAuto(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const verifyPinAuto = async (code: string) => {
    setLoading(true);
    const success = await unlockWithPin(code);
    setLoading(false);
    if (success) {
      router.push("/");
    } else {
      setPin("");
    }
  };

  const handleBiometricClick = async () => {
    setLoading(true);
    const success = await unlockWithBiometrics();
    setLoading(false);
    if (success) {
      router.push("/");
    }
  };

  const handleSaveNewPin = async () => {
    if (newPin.length !== 4) {
      toast.error(t("PIN must be 4 digits", "પિન 4 અંકનો હોવો જોઈએ"));
      return;
    }
    if (newPin !== confirmPin) {
      toast.error(t("PINs do not match", "પિન મેળ ખાતા નથી"));
      return;
    }
    const success = await setupPin(newPin);
    if (success) {
      setSetupModalOpen(false);
      setNewPin("");
      setConfirmPin("");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F5] text-stone-900 flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-amber-500/30 selection:text-amber-950 overflow-hidden">
      <MandalaBackground />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md border border-stone-200 backdrop-blur-md">
            <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-heading text-lg md:text-xl font-bold tracking-tight text-stone-900">HariSumiran</h1>
            <p className="text-[10px] font-mono tracking-widest text-amber-700 font-bold uppercase">
              {t("HariPrabodham, Nadiad", "હરિપ્રબોધમ, નડિયાદ")}
            </p>
          </div>
        </div>

        {/* Language & Persona Test Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "gu" : "en")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
          >
            <Languages className="h-3.5 w-3.5 text-amber-600" />
            <span>{language === "en" ? "ગુજરાતી" : "English"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPersonaModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-bold text-amber-800 shadow-xs hover:bg-amber-100 transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">{t("Switch Persona", "વ્યક્તિ બદલો")}</span>
          </button>
        </div>
      </header>

      {/* Center Bank-Style Unlock Keypad Card */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto py-6">
        <div className="bg-white/95 border border-stone-200/90 rounded-[36px] p-6 sm:p-8 shadow-xl backdrop-blur-2xl flex flex-col items-center text-center space-y-6">
          {/* User Avatar & Identity Badge */}
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-2 border-amber-400 p-1 shadow-md bg-amber-50/50">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"}
                alt={user?.name}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="font-heading text-xl font-bold text-stone-900">
              {t("Welcome back", "પુનઃ સ્વાગત છે")}, {user?.name}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {(user?.responsibilities || []).map((resp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 border border-amber-300 text-amber-900"
                >
                  {language === "gu" && resp.gujaratiTitle ? resp.gujaratiTitle : resp.title}
                </span>
              ))}
            </div>
          </div>

          {/* 4-Dot Passcode Indicator */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-500">
              {t("Enter 4-Digit Passcode / PIN", "૪-અંકનો પાસકોડ / પિન દાખલ કરો")}
            </p>
            <div className="flex items-center justify-center gap-4 py-2">
              {[0, 1, 2, 3].map((index) => {
                const filled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`h-4 w-4 rounded-full transition-all duration-200 ${
                      filled
                        ? "bg-gradient-to-r from-[#FF7A00] to-[#EA580C] scale-125 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                        : "bg-stone-100 border border-stone-300"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3.5 w-full max-w-xs pt-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num)}
                disabled={loading}
                className="h-14 rounded-2xl bg-stone-50 hover:bg-amber-50 active:scale-95 text-lg font-heading font-bold text-stone-900 border border-stone-200 hover:border-amber-300 transition-all flex items-center justify-center shadow-xs"
              >
                {num}
              </button>
            ))}

            {/* Biometric Quick Button */}
            <button
              type="button"
              onClick={handleBiometricClick}
              disabled={loading}
              className="h-14 rounded-2xl bg-amber-100/70 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all flex flex-col items-center justify-center text-[10px] font-bold shadow-xs active:scale-95"
              title={t("Face ID / Fingerprint", "ફેસ આઈડી / ફિંગરપ્રિન્ટ")}
            >
              <ScanFace className="h-5 w-5 mb-0.5 text-amber-700" />
              <span>{t("Biometric", "બાયોમેટ્રિક")}</span>
            </button>

            {/* 0 Button */}
            <button
              type="button"
              onClick={() => handleDigit("0")}
              disabled={loading}
              className="h-14 rounded-2xl bg-stone-50 hover:bg-amber-50 active:scale-95 text-lg font-heading font-bold text-stone-900 border border-stone-200 hover:border-amber-300 transition-all flex items-center justify-center shadow-xs"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              disabled={loading}
              className="h-14 rounded-2xl bg-stone-50 hover:bg-rose-50 hover:text-rose-600 active:scale-95 text-stone-500 border border-stone-200 transition-all flex items-center justify-center shadow-xs"
              title={t("Backspace", "પાછળ")}
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom Security Note & PIN setup */}
          <div className="flex items-center justify-between w-full text-xs text-stone-500 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setSetupModalOpen(true)}
              className="hover:text-amber-800 font-bold flex items-center gap-1 text-[11px] transition-colors text-stone-700"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-600" />
              <span>{t("Change PIN", "પિન બદલો")}</span>
            </button>
            <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-600" />
              <span>{t("Default PIN: 3690", "ડિફૉલ્ટ પિન: 3690")}</span>
            </span>
          </div>
        </div>
      </main>

      {/* Setup / Change PIN Modal */}
      <Modal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        title={t("Set New 4-Digit Passcode", "નવો ૪-અંકનો પાસકોડ સેટ કરો")}
        subtitle={t("Secure your Mandir App", "તમારી મંદિર ઍપ સુરક્ષિત કરો")}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1 uppercase">
              {t("NEW 4-DIGIT PIN", "નવો ૪-અંકનો પિન")}
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full text-center text-xl tracking-widest font-mono rounded-xl border border-stone-200 py-2.5 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1 uppercase">
              {t("CONFIRM PIN", "પિનની પુષ્ટિ કરો")}
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full text-center text-xl tracking-widest font-mono rounded-xl border border-stone-200 py-2.5 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveNewPin}
            className="w-full bg-gradient-to-r from-[#FF7A00] via-[#F59E0B] to-[#EA580C] text-white font-extrabold py-3 rounded-xl text-xs shadow-sm hover:brightness-105 transition-all"
          >
            {t("Save Passcode", "પાસકોડ સાચવો")}
          </button>
        </div>
      </Modal>

      {/* Persona Switcher Modal (For seamless V1 Scenario Testing) */}
      <Modal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        title={t("Select User Persona to Test", "પરીક્ષણ માટે વ્યક્તિ પસંદ કરો")}
        subtitle={t("Demonstrating 'One Account, Many Responsibilities'", "'એક ખાતું, અનેક જવાબદારીઓ' દર્શાવવું")}
        maxWidth="md"
      >
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {initialUsers.map((u, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                switchPersona(u.name);
                setPersonaModalOpen(false);
              }}
              className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/60 transition-all text-left group shadow-xs"
            >
              <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-xl object-cover shrink-0 mt-0.5 border border-stone-200" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xs text-stone-900 group-hover:text-amber-800 truncate">
                    {u.name}
                  </p>
                  <span className="text-[10px] font-mono text-stone-500 font-bold">PIN: 3690</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {u.responsibilities.map((r, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white border border-stone-200 text-stone-700"
                    >
                      {language === "gu" && r.gujaratiTitle ? r.gujaratiTitle : r.title}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Footer info */}
      <footer className="relative z-10 text-center text-xs text-stone-500 py-2">
        <p>© 2026 HariSumiran Platform &bull; {t("One Mandir. One App. One Account. Many Responsibilities.", "એક મંદિર. એક ઍપ. એક ખાતું. અનેક સેવા જવાબદારીઓ.")}</p>
      </footer>
    </div>
  );
}
