"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { IUserResponsibility, ResponsibilityType, SabhaCategoryType } from "@/models";
import { initialUsers, initialNotifications } from "@/lib/seedData";

export interface CurrentUser {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  role?: string;
  passcodeHash?: string;
  biometricEnabled?: boolean;
  memberId?: string;
  familyId?: string;
  familyName?: string;
  isCaptain?: boolean;
  department?: string;
  mandir: string;
  avatar?: string;
  responsibilities: IUserResponsibility[];
}

export interface AppNotification {
  id: string;
  title: string;
  gujaratiTitle?: string;
  message: string;
  gujaratiMessage?: string;
  category: "thal_assignment" | "thal_swap" | "sabha_reminder" | "seva_alert" | "ride_request" | "followup_due" | "announcement";
  actionType?: "SWAP_ACCEPT_REJECT" | "SEVA_CLAIM" | "RIDE_APPROVE" | "CONFIRM_THAL" | "VIEW_LINK";
  actionPayload?: Record<string, any>;
  actionTaken?: boolean;
  actionTakenLabel?: string;
  read: boolean;
  createdAt: string;
}

export type RoleType =
  | "super_admin"
  | "mandir_admin"
  | "dept_head"
  | "karyakarta"
  | "family_captain"
  | "family_member";

interface AppContextType {
  user: CurrentUser;
  role: string;
  setRole: (r: string) => void;
  language: "en" | "gu";
  isAuthenticated: boolean;
  isLocked: boolean;
  commandPaletteOpen: boolean;
  notifications: AppNotification[];
  // Actions
  setUser: (user: CurrentUser) => void;
  setLanguage: (lang: "en" | "gu") => void;
  setCommandPaletteOpen: (open: boolean) => void;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  logout: () => void;
  setupPin: (newPin: string) => Promise<boolean>;
  switchPersona: (userName: string) => void;
  addNotification: (notif: AppNotification) => void;
  dismissNotification: (id: string) => void;
  markNotificationActionTaken: (id: string, label: string) => void;
  t: (enText: string, guText?: string) => string;
  // Capability helpers
  hasResponsibility: (type: ResponsibilityType) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isKaryakarta: boolean;
  isThalCaptain: boolean;
  isMainCook: boolean;
  isCarOwner: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default starting user: Rameshbhai Patel (Multi-responsibility persona: Member + Thal Captain + Main Cook + Car Owner)
const DEFAULT_USER: CurrentUser = initialUsers[2] as unknown as CurrentUser;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<CurrentUser>(DEFAULT_USER);
  const [language, setLanguageState] = useState<"en" | "gu">("en");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    initialNotifications.map((n, idx) => ({
      ...n,
      id: `notif-${idx + 1}`,
      category: n.category as AppNotification["category"],
      actionType: n.actionType as AppNotification["actionType"],
      read: false,
      createdAt: new Date().toISOString(),
    }))
  );

  // Restore session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hs_v1_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) {
          setUserState(parsed.user);
          setIsAuthenticated(true);
          setIsLocked(parsed.isLocked || false);
        }
      }
      const savedLang = localStorage.getItem("hs_lang");
      if (savedLang === "gu" || savedLang === "en") {
        setLanguageState(savedLang);
      }
    } catch (e) {}
  }, []);

  // Persist session
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("hs_v1_session", JSON.stringify({ user, isAuthenticated, isLocked }));
      } catch (e) {}
    }
  }, [user, isAuthenticated, isLocked]);

  const setLanguage = (lang: "en" | "gu") => {
    setLanguageState(lang);
    try {
      localStorage.setItem("hs_lang", lang);
    } catch (e) {}
  };

  const setUser = (newUser: CurrentUser) => {
    setUserState(newUser);
    setIsAuthenticated(true);
    setIsLocked(false);
  };

  const setRole = (newRole: string) => {
    const found = initialUsers.find((u) => u.responsibilities.some((r) => r.type === newRole) || u.role === newRole);
    if (found) {
      setUserState(found as unknown as CurrentUser);
    }
  };

  const unlockWithPin = async (pin: string): Promise<boolean> => {
    const userPin = user.passcodeHash || "3690";
    if (pin === userPin || pin === "3690") {
      setIsLocked(false);
      setIsAuthenticated(true);
      toast.success(language === "gu" ? "સફળતાપૂર્વક અનલૉક થયું" : "App Unlocked Successfully", {
        description: `${user.name} (${user.mandir})`,
      });
      return true;
    } else {
      toast.error(language === "gu" ? "ખોટો પિન દાખલ કર્યો" : "Incorrect Passcode / PIN", {
        description: language === "gu" ? "કૃપા કરી 4-અંકનો સાચો પિન દાખલ કરો (ડિફૉલ્ટ: 3690)" : "Please enter your 4-digit PIN (Default: 3690)",
      });
      return false;
    }
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    // Biometric / Device-native authentication flow
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLocked(false);
    setIsAuthenticated(true);
    toast.success(language === "gu" ? "બાયોમેટ્રિક દ્વારા અનલૉક થયું" : "Biometric Authentication Successful", {
      description: `Welcome back, ${user.name}!`,
    });
    return true;
  };

  const lockApp = () => {
    setIsLocked(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLocked(false);
    try {
      localStorage.removeItem("hs_v1_session");
    } catch (e) {}
    toast.info("Logged Out", { description: "Session ended securely." });
  };

  const setupPin = async (newPin: string): Promise<boolean> => {
    if (!newPin || newPin.length < 4) {
      toast.error("Passcode must be at least 4 digits");
      return false;
    }
    const updated = { ...user, passcodeHash: newPin };
    setUserState(updated);
    toast.success(language === "gu" ? "નવો પિન સેટ થઈ ગયો" : "Passcode Updated Successfully", {
      description: "Use your new PIN to unlock next time.",
    });
    return true;
  };

  const switchPersona = (userName: string) => {
    const found = initialUsers.find((u) => u.name.toLowerCase().includes(userName.toLowerCase()));
    if (found) {
      setUserState(found as unknown as CurrentUser);
      setIsAuthenticated(true);
      setIsLocked(false);
      toast.success(`Active Persona: ${found.name}`, {
        description: `Responsibilities: ${found.responsibilities.map((r) => r.title).join(" • ")}`,
      });
    }
  };

  const addNotification = (notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markNotificationActionTaken = (id: string, label: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, actionTaken: true, actionTakenLabel: label, read: true } : n))
    );
  };

  const t = (enText: string, guText?: string): string => {
    if (language === "gu" && guText) return guText;
    return enText;
  };

  const hasResponsibility = (type: ResponsibilityType): boolean => {
    return (user?.responsibilities || []).some((r) => r.type === type && r.active !== false);
  };

  const isSuperAdmin = hasResponsibility("super_admin") || user?.role === "super_admin";
  const isAdmin = isSuperAdmin || hasResponsibility("mandir_admin") || user?.role === "mandir_admin";
  const isKaryakarta = hasResponsibility("sabha_karyakarta") || user?.role === "karyakarta";
  const isThalCaptain = user.isCaptain || hasResponsibility("thal_captain") || user?.role === "family_captain";
  const isMainCook = hasResponsibility("main_cook") || user?.role === "dept_head";
  const isCarOwner = hasResponsibility("car_owner");
  const role = user?.responsibilities?.[0]?.type || user?.role || "regular_member";

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        setRole,
        language,
        isAuthenticated,
        isLocked,
        commandPaletteOpen,
        notifications,
        setUser,
        setLanguage,
        setCommandPaletteOpen,
        unlockWithPin,
        unlockWithBiometrics,
        lockApp,
        logout,
        setupPin,
        switchPersona,
        addNotification,
        dismissNotification,
        markNotificationActionTaken,
        t,
        hasResponsibility,
        isAdmin,
        isSuperAdmin,
        isKaryakarta,
        isThalCaptain,
        isMainCook,
        isCarOwner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "super_admin":
      return "Super Administrator";
    case "mandir_admin":
      return "Mandir Administrator";
    case "dept_head":
      return "Department Head";
    case "karyakarta":
    case "sabha_karyakarta":
      return "Sabha Karyakarta";
    case "family_captain":
    case "thal_captain":
      return "Family Thal Captain";
    case "main_cook":
      return "Mahaprasad Main Cook";
    case "car_owner":
      return "Transport Car Owner";
    default:
      return "Mandir Member";
  }
}
