"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  CheckCircle2,
  BellRing,
  Sparkles,
} from "lucide-react";

interface PwaContextType {
  isInstallable: boolean;
  isStandalone: boolean;
  isIos: boolean;
  promptInstall: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  pushPermission: NotificationPermission | "unsupported";
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isStandalone: false,
  isIos: false,
  promptInstall: async () => {},
  requestPushPermission: async () => false,
  pushPermission: "default",
});

export function usePwa() {
  return useContext(PwaContext);
}

export function PwaManager({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("default");

  // 1. Service Worker Registration & Standalone Detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect Standalone Mode (Launched as PWA)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // Check Push Notification Permission
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission("unsupported");
    }

    // Capture Chrome/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      // Only show banner if user has not dismissed it in this session and not in standalone
      if (!isStandaloneMode) {
        const dismissed = sessionStorage.getItem("pwa_banner_dismissed");
        if (!dismissed) {
          setShowInstallBanner(true);
        }
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Track appinstalled event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      toast.success("HariSumiran installed successfully!", {
        description: "You can now access the app directly from your home screen.",
      });
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 2. Trigger Installation
  const promptInstall = useCallback(async () => {
    if (isStandalone) {
      toast.info("App is already installed", {
        description: "You are already running HariSumiran in standalone PWA mode.",
      });
      return;
    }

    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      toast.info("Install HariSumiran from your browser menu", {
        description: "Tap your browser settings (three dots) and select 'Install app' or 'Add to Home screen'.",
      });
      return;
    }

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstallable(false);
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err: any) {
      console.error("[PWA] Install prompt error:", err);
    }
  }, [deferredPrompt, isIos, isStandalone]);

  // 3. Request Push Notification Permission & Register Token
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast.error("Push notifications are not supported on this browser.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        toast.success("Notification permissions enabled!", {
          description: "You will receive real-time alerts when new devotees are onboarded.",
        });

        // Register web device token with backend
        try {
          const deviceToken = "web_pwa_" + (user?._id || "admin") + "_" + Date.now();
          await fetch("/api/notifications/register-device", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?._id || undefined,
              phone: user?.phone || "9816357000",
              deviceToken,
              platform: isIos ? "ios" : "android",
            }),
          });
        } catch (regErr) {
          console.warn("[PWA] Web token registration warning:", regErr);
        }

        return true;
      } else {
        toast.error("Notifications blocked", {
          description: "Please enable notifications in your browser or device settings to receive alerts.",
        });
        return false;
      }
    } catch (err: any) {
      toast.error("Error requesting notification permission: " + err.message);
      return false;
    }
  }, [user, isIos]);

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isStandalone,
        isIos,
        promptInstall,
        requestPushPermission,
        pushPermission,
      }}
    >
      {children}

      {/* ======================================================== */}
      {/* 1. FLOATING PWA INSTALL PROMPT BANNER (Mobile/Desktop)   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showInstallBanner && !isStandalone && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-4 rounded-3xl bg-white/95 backdrop-blur-2xl border border-amber-300 shadow-[0_12px_40px_rgba(217,119,6,0.18)] flex items-start gap-3.5"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
              <Smartphone className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-xs font-bold text-stone-900">
                  Install HariSumiran App
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9px] font-bold uppercase font-mono">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-snug mt-0.5">
                Install on your phone for full-screen access &amp; instant onboarding push alerts.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={promptInstall}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Install Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInstallBanner(false);
                    sessionStorage.setItem("pwa_banner_dismissed", "true");
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-medium transition-colors"
                >
                  Later
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowInstallBanner(false);
                sessionStorage.setItem("pwa_banner_dismissed", "true");
              }}
              className="text-stone-400 hover:text-stone-700 p-1"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 2. IOS SAFARI "ADD TO HOME SCREEN" MODAL                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showIosInstructions && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-stone-200"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-stone-900">
                      Install on iPhone / iPad
                    </h3>
                    <p className="text-[11px] text-stone-500">Safari Add to Home Screen</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIosInstructions(false)}
                  className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="h-7 w-7 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-stone-900">Tap the Share Button</p>
                    <p className="text-stone-500 flex items-center gap-1.5">
                      In Safari toolbar at the bottom of your screen, tap the
                      <Share className="h-3.5 w-3.5 text-blue-600 inline" /> icon.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="h-7 w-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-stone-900">Select &quot;Add to Home Screen&quot;</p>
                    <p className="text-stone-500 flex items-center gap-1.5">
                      Scroll down and tap
                      <span className="font-semibold text-stone-800 flex items-center gap-1">
                        <PlusSquare className="h-3.5 w-3.5 text-amber-600 inline" /> Add to Home Screen
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-emerald-900 font-medium">
                    HariSumiran will be installed as a native app with full-screen access and instant alerts.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosInstructions(false)}
                className="w-full py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PwaContext.Provider>
  );
}
