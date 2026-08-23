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

export interface CurrentUser {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  role: RoleType;
  department?: string;
  mandir: string;
  avatar?: string;
}

const DEFAULT_USERS: Record<RoleType, CurrentUser> = {
  super_admin: {
    name: "Pooja Swarupji",
    phone: "9825012345",
    email: "admin.super@harisumiran.org",
    role: "super_admin",
    mandir: "HariPrabodham, Nadiad",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  mandir_admin: {
    name: "Nitinbhai Patel",
    phone: "9825023456",
    email: "nitin.patel@harisumiran.org",
    role: "mandir_admin",
    department: "Operations & Administration",
    mandir: "HariPrabodham, Nadiad",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  dept_head: {
    name: "Dipakbhai Shah",
    phone: "9825034567",
    email: "dipak.shah@harisumiran.org",
    role: "dept_head",
    department: "Kitchen (Mahaprasad)",
    mandir: "HariPrabodham, Nadiad",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  karyakarta: {
    name: "Jaimin Trivedi",
    phone: "9825045678",
    email: "jaimin.trivedi@harisumiran.org",
    role: "karyakarta",
    department: "Sabha & Follow-up",
    mandir: "HariPrabodham, Nadiad",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  },
  family_captain: {
    name: "Rameshbhai Patel",
    phone: "9825056789",
    email: "ramesh.patel@gmail.com",
    role: "family_captain",
    mandir: "HariPrabodham, Nadiad",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  family_member: {
    name: "Devansh Patel",
    phone: "9825067890",
    email: "devansh.patel@gmail.com",
    role: "family_member",
    mandir: "HariPrabodham, Nadiad",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
};

interface AppContextType {
  role: RoleType;
  user: CurrentUser;
  language: "en" | "gu";
  syncStatus: "synced" | "syncing" | "offline";
  commandPaletteOpen: boolean;
  setRole: (role: RoleType) => void;
  setUser: (user: CurrentUser) => void;
  setLanguage: (lang: "en" | "gu") => void;
  setCommandPaletteOpen: (open: boolean) => void;
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
        setRole,
        setUser,
        setLanguage,
        setCommandPaletteOpen,
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
