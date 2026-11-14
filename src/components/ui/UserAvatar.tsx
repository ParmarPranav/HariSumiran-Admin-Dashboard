"use client";

import React, { useState } from "react";
import { ShieldCheck, Crown, Sparkles } from "lucide-react";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  role?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
}

// Generates clean 2-letter monogram (e.g., "Gopal Shaktipada Adhikari" -> "GA", "HP Super Admin" -> "HP")
export function getInitials(name: string): string {
  if (!name) return "HP";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

// Role-based calibrated luxury gradients
export function getRoleAvatarGradient(role?: string): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (role) {
    case "super_admin":
      return {
        bg: "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700",
        text: "text-white",
        border: "ring-2 ring-amber-400 ring-offset-2 ring-offset-white",
        glow: "shadow-md shadow-amber-500/30",
      };
    case "mandir_admin":
      return {
        bg: "bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800",
        text: "text-white",
        border: "ring-2 ring-emerald-500 ring-offset-2 ring-offset-white",
        glow: "shadow-md shadow-emerald-500/25",
      };
    case "karyakarta":
    case "sabha_karyakarta":
      return {
        bg: "bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700",
        text: "text-white",
        border: "ring-1 ring-sky-300 ring-offset-1 ring-offset-white",
        glow: "shadow-md shadow-sky-500/20",
      };
    case "family_captain":
    case "thal_captain":
      return {
        bg: "bg-gradient-to-br from-[#EA580C] via-orange-600 to-amber-600",
        text: "text-white",
        border: "ring-1 ring-orange-300 ring-offset-1 ring-offset-white",
        glow: "shadow-md shadow-orange-500/20",
      };
    case "dept_head":
    case "main_cook":
      return {
        bg: "bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800",
        text: "text-white",
        border: "ring-1 ring-purple-300 ring-offset-1 ring-offset-white",
        glow: "shadow-md shadow-purple-500/20",
      };
    default:
      return {
        bg: "bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800",
        text: "text-white",
        border: "ring-1 ring-stone-200 ring-offset-1 ring-offset-white",
        glow: "shadow-sm shadow-stone-500/15",
      };
  }
}

export function UserAvatar({
  name,
  avatarUrl,
  role,
  size = "md",
  className = "",
  showBadge = true,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const isSuperAdmin = role === "super_admin";
  const palette = getRoleAvatarGradient(role);

  // Size mapping
  const sizeClasses = {
    sm: "h-8 w-8 rounded-xl text-xs",
    md: "h-11 w-11 rounded-2xl text-sm",
    lg: "h-14 w-14 rounded-2xl text-base",
    xl: "h-16 w-16 rounded-3xl text-lg",
  };

  const badgeSizeClasses = {
    sm: "h-3.5 w-3.5 -bottom-0.5 -right-0.5 text-[8px]",
    md: "h-4 w-4 -bottom-1 -right-1 text-[9px]",
    lg: "h-5 w-5 -bottom-1 -right-1 text-[10px]",
    xl: "h-6 w-6 -bottom-1.5 -right-1.5 text-xs",
  };

  // Only display photo if it is an authentic user-provided picture, not a random stock photo
  const hasCustomPhoto =
    avatarUrl &&
    !imageError &&
    !avatarUrl.includes("ui-avatars.com") &&
    !avatarUrl.includes("images.unsplash.com") &&
    (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:"));

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <div
        className={`relative flex items-center justify-center font-display font-black tracking-tight overflow-hidden transition-all ${
          sizeClasses[size]
        } ${palette.border} ${palette.glow} ${
          hasCustomPhoto ? "bg-stone-100" : `${palette.bg} ${palette.text}`
        }`}
      >
        {hasCustomPhoto ? (
          <img
            src={avatarUrl}
            alt={name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="relative z-10 drop-shadow-xs font-mono font-black">
            {initials}
          </span>
        )}

        {/* Specular Inner Glare */}
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]" />
      </div>

      {/* Super Admin Gold Crown / Shield Badge */}
      {showBadge && isSuperAdmin && (
        <span
          className={`absolute flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs border-2 border-white ring-1 ring-amber-400 ${badgeSizeClasses[size]}`}
          title="Root Super Administrator"
        >
          <ShieldCheck className="h-2.5 w-2.5 stroke-[2.5]" />
        </span>
      )}
    </div>
  );
}
