"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import { Modal } from "@/components/ui/Modal";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Languages,
  Users,
  Sparkles,
  Loader2,
  CheckCircle2,
  Building2,
  UtensilsCrossed,
  Crown,
  UserCheck,
  Check,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { initialUsers } from "@/lib/seedData";

export default function AuthPage() {
  const router = useRouter();
  const {
    loginWithEmail,
    switchPersona,
    language,
    setLanguage,
    t,
  } = useApp();

  const [email, setEmail] = useState("harisumiran369@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t("Please enter your email or phone number", "કૃપા કરી તમારો ઈમેલ અથવા મોબાઈલ નંબર દાખલ કરો"));
      return;
    }

    setLoading(true);
    const success = await loginWithEmail(email, password);
    setLoading(false);

    if (success) {
      router.push("/");
    }
  };

  const handleSelectDemoAccount = async (demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setPassword("3690");
    setLoading(true);
    const success = await loginWithEmail(demoEmail, "3690");
    setLoading(false);
    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#FAF8F5] text-stone-900 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-amber-500/30 selection:text-amber-950 overflow-x-hidden">
      <MandalaBackground />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md border border-stone-200/90 backdrop-blur-md">
            <img src="/logo.png" alt="HariSumiran Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg md:text-xl font-bold tracking-tight text-stone-900">HariSumiran</h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-amber-100/70 border border-amber-200 text-[10px] font-mono font-bold text-amber-900 uppercase">
                Enterprise Node
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-widest text-amber-700 font-bold uppercase">
              {t("HariPrabodham, Nadiad", "હરિપ્રબોધમ, નડિયાદ")}
            </p>
          </div>
        </div>

        {/* Language & Demo Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "gu" : "en")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Languages className="h-3.5 w-3.5 text-amber-600" />
            <span>{language === "en" ? "ગુજરાતી" : "English"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPersonaModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-bold text-amber-800 shadow-xs hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">{t("Demo Personas", "ડેમો વ્યક્તિઓ")}</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <main className="relative z-10 w-full max-w-7xl mx-auto my-auto py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left Column: Enterprise Hero Branding (Light, High-Status Temple Theme) */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            
            {/* Step Verification Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-xs font-semibold w-fit shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{t("Step 1: Sevak Credentials Verification", "પગલું ૧: સેવક ઓળખપત્ર ચકાસણી")}</span>
            </div>

            {/* Sub-label */}
            <p className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase">
              {t("BUSINESS & TEMPLE INTELLIGENCE PLATFORM", "મંદિર સંચાલન અને સેવા વ્યવસ્થાપન પ્લેટફોર્મ")}
            </p>

            {/* Massive Display Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.14]">
              {t("An Intelligent ", "એક બુદ્ધિશાળી ")}
              <span className="text-[#EA580C]">
                {t("Multi-Responsibility", "બહુ-સેવા જવાબદારી")}
              </span>
              <br />
              {t("Mandir Management System", "મંદિર સંચાલન પ્રણાલી")}
            </h2>

            {/* Subtitle with vertical accent bar */}
            <div className="flex items-start gap-3 border-l-2 border-amber-500 pl-4 py-0.5">
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                {t(
                  "Step 1 of 2: Authenticate authorized Sevak & Administrator credentials to coordinate sabha attendance, family thal logistics, and mahaprasad operations.",
                  "પગલું ૧/૨: સભા હાજરી, પારિવારિક થાળ અને મહાપ્રસાદ કામગીરીના સંકલન માટે અધિકૃત સેવક ઓળખપત્ર ચકાસો."
                )}
              </p>
            </div>

            {/* 4 Feature Module Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-xl">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/85 border border-stone-200/80 shadow-xs backdrop-blur-md">
                <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">{t("17+ Seva Modules", "૧૭+ સેવા વિભાગો")}</p>
                  <p className="text-[10px] text-stone-500">{t("Real-time department sync", "રીયલ-ટાઇમ સંકલન")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/85 border border-stone-200/80 shadow-xs backdrop-blur-md">
                <div className="h-8 w-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700 shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">{t("Family Thal & Rosters", "પારિવારિક થાળ અને રોસ્ટર")}</p>
                  <p className="text-[10px] text-stone-500">{t("One account, many roles", "એક ખાતું, અનેક સેવા")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/85 border border-stone-200/80 shadow-xs backdrop-blur-md">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">{t("Mahaprasad Logistics", "મહાપ્રસાદ રસોડું વ્યવસ્થા")}</p>
                  <p className="text-[10px] text-stone-500">{t("Dynamic batch recipe scaling", "સ્માર્ટ જથ્થો ગણતરી")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/85 border border-stone-200/80 shadow-xs backdrop-blur-md">
                <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">{t("Role-Based Security", "ભૂમિકા આધારિત સુરક્ષા")}</p>
                  <p className="text-[10px] text-stone-500">{t("256-Bit encrypted node", "એન્ક્રિપ્ટેડ પોર્ટલ")}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Node Authentication Form */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Header Above Form Card */}
            <div className="text-left space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                {t("Node Authentication", "સેવક પ્રમાણીકરણ")}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                {t("Step 1 of 2: Provide security credentials to proceed.", "પગલું ૧: આગળ વધવા સુરક્ષા ઓળખપત્ર દાખલ કરો.")}
              </p>
            </div>

            {/* Elevated Form Card */}
            <div className="bg-white/95 border border-stone-200/90 rounded-[24px] p-6 sm:p-8 shadow-xl shadow-stone-200/50 backdrop-blur-2xl flex flex-col space-y-5">
              
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Field 1: Email or Sevak Identifier */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-600 block uppercase tracking-wider">
                    {t("EMAIL / NODE IDENTIFIER", "ઈમેલ / સેવક આઈડી")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@harisumiran.org"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-stone-50/70 hover:bg-white focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Field 2: Security Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-600 block uppercase tracking-wider">
                      {t("SECURITY KEY", "સુરક્ષા કી / પાસવર્ડ")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-xs text-amber-700 hover:text-amber-900 font-semibold transition-colors cursor-pointer"
                    >
                      {t("Forgot?", "ભૂલી ગયા?")}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-stone-50/70 hover:bg-white focus:bg-white transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Keep Signed In Checkbox */}
                <div className="flex items-center pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs text-stone-600 font-medium">
                      {t("Keep me signed in on this workstation", "આ ડિવાઇસ પર સાઇન ઇન રાખો")}
                    </span>
                  </label>
                </div>

                {/* Big Primary CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#DB4C0D] via-[#EA580C] to-[#F59E0B] text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("Verifying Credentials...", "ચકાસણી થઈ રહી છે...")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("Proceed to Mandir Dashboard", "ડેશબોર્ડ પર આગળ વધો")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Testing Accounts */}
              <div className="pt-3 border-t border-stone-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold">
                  <span className="flex items-center gap-1 text-amber-800 font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    {t("1-Click Demo Accounts:", "ઝડપી ડેમો એકાઉન્ટ:")}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Password: 3690</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount("harisumiran369@gmail.com", "Nitinbhai Patel")}
                    className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-amber-50/80 hover:border-amber-300 transition-all text-left group cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-stone-800 group-hover:text-amber-900 truncate">
                        Mandir Admin
                      </p>
                      <p className="text-[9px] text-stone-500 truncate">Nitinbhai</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount("admin.super@harisumiran.org", "Pooja Swarupji")}
                    className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-amber-50/80 hover:border-amber-300 transition-all text-left group cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-lg bg-orange-500/10 text-orange-700 flex items-center justify-center shrink-0">
                      <Crown className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-stone-800 group-hover:text-amber-900 truncate">
                        Super Admin
                      </p>
                      <p className="text-[9px] text-stone-500 truncate">Pooja Swarupji</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount("ramesh.patel@gmail.com", "Rameshbhai Patel")}
                    className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-amber-50/80 hover:border-amber-300 transition-all text-left group cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                      <UtensilsCrossed className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-stone-800 group-hover:text-amber-900 truncate">
                        Thal & Kitchen
                      </p>
                      <p className="text-[9px] text-stone-500 truncate">Rameshbhai</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount("jaimin.trivedi@harisumiran.org", "Jaimin Trivedi")}
                    className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-amber-50/80 hover:border-amber-300 transition-all text-left group cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0">
                      <UserCheck className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-stone-800 group-hover:text-amber-900 truncate">
                        Karyakarta
                      </p>
                      <p className="text-[9px] text-stone-500 truncate">Jaimin</p>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Live Operational Status Bar (Inspired by Toast in Reference Image) */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/90 border border-stone-200/90 shadow-xs text-xs text-stone-600 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </div>
                <span className="font-semibold text-[11px] text-stone-700">
                  {t("Temple Node Online & Verified", "મંદિર નોડ સક્રિય અને ચકાસાયેલ")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px]">
                <Cpu className="h-3 w-3 text-stone-400" />
                <span>NADIAD-NODE-01</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title={t("Reset Password", "પાસવર્ડ રીસેટ")}
        subtitle={t("Mandir Administrator Assistance", "મંદિર વહીવટકર્તા સહાય")}
        maxWidth="sm"
      >
        <div className="space-y-4 text-left text-xs text-stone-600">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <p className="font-bold">{t("Need assistance resetting your password?", "પાસવર્ડ રીસેટ કરવા માટે મદદ જોઈએ છે?")}</p>
            <p className="text-[11px] leading-relaxed">
              {t(
                "For institutional security, passwords can be reset by the Mandir Super Administrator or using the demo password '3690'.",
                "સંસ્થાકીય સુરક્ષા માટે, પાસવર્ડ મંદિર સુપર એડમિનિસ્ટ્રેટર દ્વારા રીસેટ કરી શકાય છે અથવા ડેમો પાસવર્ડ '3690' વાપરી શકાય છે."
              )}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-stone-700">{t("Helpdesk Contacts:", "સહાયક સંપર્ક:")}</p>
            <p className="font-mono text-[11px] text-stone-600">support@harisumiran.org &bull; +91 98250 23456</p>
          </div>
          <button
            type="button"
            onClick={() => setForgotModalOpen(false)}
            className="w-full bg-stone-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-stone-800 transition-colors"
          >
            {t("Close", "બંધ કરો")}
          </button>
        </div>
      </Modal>

      {/* Persona Switcher Modal */}
      <Modal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        title={t("Select User Account to Test", "પરીક્ષણ માટે એકાઉન્ટ પસંદ કરો")}
        subtitle={t("Demonstrating 'One Account, Many Responsibilities'", "'એક ખાતું, અનેક જવાબદારીઓ' દર્શાવવું")}
        maxWidth="md"
      >
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {initialUsers.map((u, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleSelectDemoAccount(u.email, u.name);
                setPersonaModalOpen(false);
              }}
              className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/60 transition-all text-left group shadow-xs cursor-pointer"
            >
              <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-xl object-cover shrink-0 mt-0.5 border border-stone-200" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xs text-stone-900 group-hover:text-amber-800 truncate">
                    {u.name}
                  </p>
                  <span className="text-[10px] font-mono text-stone-500 font-bold">{u.email}</span>
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

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 text-xs text-stone-500">
        <p>© 2026 HariSumiran Platform &bull; {t("One Mandir. One App. One Account. Many Responsibilities.", "એક મંદિર. એક ઍપ. એક ખાતું. અનેક સેવા જવાબદારીઓ.")}</p>
        <p className="font-mono text-[11px] text-stone-400">Node Cluster: HP-NADIAD-01 &bull; v1.2.0</p>
      </footer>
    </div>
  );
}
