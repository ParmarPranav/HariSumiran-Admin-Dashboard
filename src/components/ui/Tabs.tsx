"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "pill" | "line";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "pill",
}: TabsProps) {
  if (variant === "line") {
    return (
      <div className={cn("flex space-x-6 border-b border-hairline", className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors",
                isActive ? "text-primary-container font-semibold" : "text-charcoal-subtle hover:text-charcoal"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    isActive ? "bg-saffron-100 text-saffron-800" : "bg-surface-container text-charcoal-subtle"
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex rounded-2xl border border-hairline bg-surface-container-low p-1", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors",
              isActive ? "text-charcoal font-semibold shadow-subtle" : "text-charcoal-subtle hover:text-charcoal"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl bg-white"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
                    isActive ? "bg-saffron-100 text-saffron-700" : "bg-surface-container text-charcoal-subtle"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
