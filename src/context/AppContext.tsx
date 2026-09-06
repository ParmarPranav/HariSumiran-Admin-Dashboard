"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export type RoleType =
  | "super_admin"
  | "mandir_admin"
  | "dept_head"
  | "karyakarta"
  | "family_captain"
  | "family_member";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type?: "thal_reminder" | "swap_alert" | "system";
  read?: boolean;
}

export interface CurrentUser {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  role: RoleType;
  department?: string;
  mandir: string;
  avatar?: string;
  authProvider?: "apple" | "phone" | "demo";
  appleId?: string;
  familyId?: string;
  familyName?: string;
  isCaptain?: boolean;
}

const DEFAULT_USERS: Record<RoleType, CurrentUser> = {
  super_admin: {
    name: "Pooja Swarupji",
    phone: "9825012345",
    email: "admin.super@harisumiran.org",
    role: "super_admin",
    mandir: "HariPrabodham, Nadiad",
    authProvider: "phone",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  mandir_admin: {
    name: "Nitinbhai Patel",
    phone: "9825023456",
    email: "nitin.patel@harisumiran.org",
    role: "mandir_admin",
    department: "Operations & Administration",
    mandir: "HariPrabodham, Nadiad",
    authProvider: "phone",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  dept_head: {
    name: "Dipakbhai Shah",
    phone: "9825034567",
    email: "dipak.shah@harisumiran.org",
    role: "dept_head",
    department: "Kitchen (Mahaprasad)",
    mandir: "HariPrabodham, Nadiad",
    authProvider: "phone",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  karyakarta: {
    name: "Jaimin Trivedi",
    phone: "9825045678",
    email: "jaimin.trivedi@harisumiran.org",
    role: "karyakarta",
    department: "Sabha & Follow-up",
    mandir: "HariPrabodham, Nadiad",
    authProvider: "phone",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  },
  family_captain: {
    name: "Rameshbhai Patel",
    phone: "9825056789",
    email: "ramesh.patel@gmail.com",
    role: "family_captain",
    mandir: "HariPrabodham, Nadiad",
    authProvider: "apple",
    appleId: "001928.82390184.apple",
    familyId: "FAM-101",
    familyName: "Patel Household (Rameshbhai)",
    isCaptain: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  family_member: {
    name: "Devansh Patel",
    phone: "9825067890",
    email: "devansh.patel@gmail.com",
    role: "family_member",
    mandir: "HariPrabodham, Nadiad",
    authProvider: "apple",
    appleId: "001928.99283741.apple",
    familyId: "FAM-101",
    familyName: "Patel Household (Rameshbhai)",
    isCaptain: false,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
};

interface AppContextType {
  role: RoleType;
  user: CurrentUser;
  language: "en" | "gu";
  syncStatus: "synced" | "syncing" | "offline";
  commandPaletteOpen: boolean;
  notifications: AppNotification[];
  isAuthenticated: boolean;
  setRole: (role: RoleType) => void;
  setUser: (user: CurrentUser) => void;
  setLanguage: (lang: "en" | "gu") => void;
  setCommandPaletteOpen: (open: boolean) => void;
  loginWithCredentials: (email: string, password?: string) => { isAdmin: boolean };
  loginWithGoogle: (googleUser?: { name?: string; email?: string }) => void;
  loginWithApple: (appleUser: { name: string; email: string; appleId: string }) => void;
  logout: () => void;
  addNotification: (notif: AppNotification) => void;
  dismissNotification: (id: string) => void;
  triggerSync: () => void;
  t: (key: string, gujaratiFallback?: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType>("mandir_admin");
  const [user, setUserState] = useState<CurrentUser>(DEFAULT_USERS["mandir_admin"]);
  const [language, setLanguage] = useState<"en" | "gu">("en");
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-1",
      title: "Thal Seva Tomorrow Reminder",
      message: "Patel Household (Rameshbhai) has Dinner Thal turn scheduled for tomorrow!",
      date: "2026-09-06",
      type: "thal_reminder",
      read: false,
    },
  ]);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    const newUser = DEFAULT_USERS[newRole];
    setUserState(newUser);
    toast.success(`Switched role to: ${getRoleLabel(newRole)}`, {
      description: `Viewing workspace as ${newUser.name} (${newUser.mandir})`,
    });
  };

  const setUser = (newUser: CurrentUser) => {
    setUserState(newUser);
    setRoleState(newUser.role);
    setIsAuthenticated(true);
  };

  const loginWithCredentials = (email: string, password?: string) => {
    const isAdminCredentials = email === "harisumiran369@gmail.com" && password === "Atmiyata@3690";
    if (isAdminCredentials) {
      const adminUser = DEFAULT_USERS["mandir_admin"];
      setUserState({ ...adminUser, email });
      setRoleState("mandir_admin");
      setIsAuthenticated(true);
      toast.success("Authenticated as Mandir Administrator", {
        description: "Welcome Nitinbhai Patel! Admin rotation control enabled.",
      });
      return { isAdmin: true };
    } else {
      const devoteeUser = DEFAULT_USERS["family_captain"];
      setUserState({ ...devoteeUser, email: email || "devotee@harisumiran.org" });
      setRoleState("family_captain");
      setIsAuthenticated(true);
      toast.success("Authenticated as Devotee User", {
        description: `Welcome! Family Thal schedule & profile loaded.`,
      });
      return { isAdmin: false };
    }
  };

  const loginWithGoogle = (googleUser?: { name?: string; email?: string }) => {
    const newUser: CurrentUser = {
      name: googleUser?.name || "Rameshbhai Patel",
      email: googleUser?.email || "ramesh.patel@gmail.com",
      phone: "9825056789",
      role: "family_captain",
      mandir: "HariPrabodham, Nadiad",
      authProvider: "demo",
      familyId: "FAM-101",
      familyName: "Patel Household (Rameshbhai)",
      isCaptain: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    };
    setUserState(newUser);
    setRoleState("family_captain");
    setIsAuthenticated(true);
    toast.success("Authenticated via Google", {
      description: `Welcome, ${newUser.name}! Signed in via Google Account.`,
    });
  };

  const loginWithApple = (appleUser: { name: string; email: string; appleId: string }) => {
    const newUser: CurrentUser = {
      name: appleUser.name || "Apple Devotee",
      email: appleUser.email || "devotee@apple.com",
      phone: "9825099999",
      role: "family_captain",
      mandir: "HariPrabodham, Nadiad",
      authProvider: "apple",
      appleId: appleUser.appleId,
      familyId: "FAM-101",
      familyName: "Patel Household (Rameshbhai)",
      isCaptain: true,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    };
    setUserState(newUser);
    setRoleState("family_captain");
    setIsAuthenticated(true);
    toast.success("Signed in with Apple ID", {
      description: `Welcome, ${newUser.name}! Authenticated via Apple ID.`,
    });
  };

  // Restore session from localStorage on mount so refresh stays logged in
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("hs_session");
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.isAuthenticated && parsed.user) {
          setUserState(parsed.user);
          setRoleState(parsed.role || parsed.user.role || "mandir_admin");
          setIsAuthenticated(true);
        }
      }
    } catch (e) {}
  }, []);

  // Save session state to localStorage whenever authenticated state or user updates
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        localStorage.setItem("hs_session", JSON.stringify({ user, role, isAuthenticated: true }));
      } catch (e) {}
    }
  }, [isAuthenticated, user, role]);

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("hs_session");
    } catch (e) {}
    toast.info("Logged Out", { description: "Session cleared. Returned to Login." });
  };

  const addNotification = (notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const triggerSync = () => {
    setSyncStatus("syncing");
    setTimeout(() => {
      setSyncStatus("synced");
      toast.success("Mandir Data Synced", {
        description: "Local cache reconciled with MongoDB Atlas.",
      });
    }, 1000);
  };

  const t = (enText: string, guText?: string): string => {
    if (language === "gu" && guText) return guText;
    return enText;
  };

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        language,
        syncStatus,
        commandPaletteOpen,
        notifications,
        isAuthenticated,
        setRole,
        setUser,
        setLanguage,
        setCommandPaletteOpen,
        loginWithCredentials,
        loginWithGoogle,
        loginWithApple,
        logout,
        addNotification,
        dismissNotification,
        triggerSync,
        t,
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

export function getRoleLabel(role: RoleType): string {
  switch (role) {
    case "super_admin":
      return "Super Administrator";
    case "mandir_admin":
      return "Mandir Administrator";
    case "dept_head":
      return "Department Head";
    case "karyakarta":
      return "Karyakarta (Field Volunteer)";
    case "family_captain":
      return "Family Captain";
    case "family_member":
      return "Family Member";
  }
}
