"use client";

import React from "react";
import {
  Mic2,
  Projector,
  Sliders,
  Video,
  Volume2,
  Soup,
  UtensilsCrossed,
  Zap,
  Sparkles,
  SunMedium,
  Armchair,
  Truck,
  Package,
  Wrench,
  ShieldAlert,
} from "lucide-react";

interface AssetIconProps {
  iconType?: string;
  category?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AssetIcon({ iconType, category, className = "", size = "md" }: AssetIconProps) {
  const normalizedType = (iconType || "").toLowerCase();
  const normalizedCat = (category || "").toLowerCase();

  const sizeClass =
    size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4 w-4";

  if (normalizedType === "mic" || normalizedCat.includes("mic")) {
    return <Mic2 className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "projector" || normalizedCat.includes("projector")) {
    return <Projector className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "mixer" || normalizedCat.includes("mixer")) {
    return <Sliders className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "camera" || normalizedCat.includes("camera") || normalizedCat.includes("video")) {
    return <Video className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "speaker" || normalizedCat.includes("speaker") || normalizedCat.includes("sound")) {
    return <Volume2 className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "cauldron" || normalizedCat.includes("cauldron")) {
    return <Soup className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "utensils" || normalizedCat.includes("kitchen")) {
    return <UtensilsCrossed className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "generator" || normalizedCat.includes("power")) {
    return <Zap className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "light" || normalizedCat.includes("lighting")) {
    return <SunMedium className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "chair" || normalizedCat.includes("furniture")) {
    return <Armchair className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "vehicle" || normalizedCat.includes("vehicle") || normalizedCat.includes("car")) {
    return <Truck className={`${sizeClass} ${className}`} />;
  }
  if (normalizedType === "facility" || normalizedCat.includes("utility")) {
    return <Wrench className={`${sizeClass} ${className}`} />;
  }

  return <Package className={`${sizeClass} ${className}`} />;
}
