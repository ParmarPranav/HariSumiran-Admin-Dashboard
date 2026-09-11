"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MandalaBackground } from "@/components/ui/MandalaBackground";
import {
  ChefHat,
  Scale,
  Users,
  Clock,
  Printer,
  Sparkles,
  Plus,
  CheckCircle2,
  UtensilsCrossed,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { initialRecipes } from "@/lib/seedData";

export default function KitchenPage() {
  const { user, t, language, isMainCook, isAdmin } = useApp();

  const [recipes, setRecipes] = useState<any[]>(initialRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(initialRecipes[0]);
  const [headcount, setHeadcount] = useState<number>(150);
  const [calculatedIngredients, setCalculatedIngredients] = useState<any[]>([]);
  const [newRecipeModalOpen, setNewRecipeModalOpen] = useState(false);

  // Recalculate ingredient quantities whenever selectedRecipe or headcount changes
  useEffect(() => {
    if (selectedRecipe) {
      const factor = Math.max(1, headcount) / 10;
      const ingList = (selectedRecipe.ingredients || []).map((ing: any) => ({
        ...ing,
        calculatedQuantity: Number((ing.quantityPer10People * factor).toFixed(2)),
      }));
      setCalculatedIngredients(ingList);
    }
  }, [selectedRecipe, headcount]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative min-h-full p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <MandalaBackground />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-amber-400" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-white">
              {t("Bhojanshala Kitchen Management", "ભોજનશાળા રસોઈ વ્યવસ્થા")}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            {t("Mahaprasad recipes, dynamic ingredient scaler, and preparation requirements", "મહાપ્રસાદ રેસિપી, સામગ્રી કેલ્ક્યુલેટર અને તૈયારી")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            leftIcon={<Printer className="h-4 w-4 text-slate-400" />}
            onClick={handlePrint}
          >
            {t("Print Prep Card", "પ્રિન્ટ કાર્ડ")}
          </Button>

          {(isAdmin || isMainCook) && (
            <Button
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setNewRecipeModalOpen(true)}
            >
              {t("New Recipe", "નવી રેસિપી")}
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Recipe Selector & Interactive Headcount Calculator */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recipe Catalog */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard className="p-4 space-y-3">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>{t("Select Prasadi Recipe", "પ્રસાદી વાનગી પસંદ કરો")}</span>
            </h3>

            <div className="space-y-2">
              {recipes.map((rec) => {
                const isSelected = selectedRecipe?.recipeCode === rec.recipeCode;
                return (
                  <button
                    key={rec.recipeCode}
                    onClick={() => setSelectedRecipe(rec)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-400/50 shadow-md text-white ring-1 ring-amber-400/30"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">
                        {language === "gu" && rec.gujaratiName ? rec.gujaratiName : rec.name}
                      </span>
                      <Badge variant={isSelected ? "primary" : "default"} size="sm">
                        {rec.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {rec.prepTimeMinutes} min
                      </span>
                      <span>&bull;</span>
                      <span>{rec.ingredients?.length || 0} {t("ingredients", "સામગ્રી")}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Headcount Scaling & Ingredient Shopping Manifest */}
        <div className="lg:col-span-8 space-y-4">
          {/* Headcount Adjuster Card */}
          <GlassCard className="p-5 border-l-4 border-l-amber-500 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  {t("DYNAMIC QUANTITY CALCULATOR", "સામગ્રી કેલ્ક્યુલેટર")}
                </span>
                <h3 className="font-heading text-lg font-bold text-white">
                  {language === "gu" && selectedRecipe?.gujaratiName
                    ? selectedRecipe.gujaratiName
                    : selectedRecipe?.name}
                </h3>
              </div>

              {/* Headcount Input & Presets */}
              <div className="flex items-center gap-3 bg-white/[0.04] p-2 rounded-2xl border border-white/10">
                <Users className="h-4 w-4 text-slate-400 ml-1" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-400">{t("For", "માટે:")}</span>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    step={10}
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value) || 10)}
                    className="w-20 bg-black/40 font-mono font-bold text-sm text-center py-1 rounded-xl border border-amber-400/40 text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs font-bold text-white">{t("Devotees", "ભક્તો")}</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              <span className="text-[11px] font-medium text-slate-400">{t("Quick Presets:", "ઝડપી પસંદગી:")}</span>
              {[50, 100, 150, 250, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setHeadcount(val)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    headcount === val
                      ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30"
                      : "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-slate-300"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Scaled Ingredients Table */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-400" />
                <h4 className="font-heading text-sm font-bold text-white">
                  {t("Required Ingredients Checklist", "જરૂરી સામગ્રી યાદી")}
                </h4>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {t("Total", "કુલ")}: {calculatedIngredients.length} {t("Items", "વસ્તુઓ")}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-2">{t("Ingredient Name", "સામગ્રીનું નામ")}</th>
                    <th className="pb-2 text-right">{t("Base (10 Devotees)", "પ્રમાણ (૧૦ ભક્ત)")}</th>
                    <th className="pb-2 text-right font-black text-amber-400">
                      {t("Total Needed", "જરૂરી જથ્થો")} ({headcount} {t("pax", "વ્યક્તિ")})
                    </th>
                    <th className="pb-2 text-center">{t("Status", "સ્થિતિ")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {calculatedIngredients.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-2.5 font-bold text-white">
                        {language === "gu" && item.gujaratiName ? item.gujaratiName : item.name}
                        {item.notes && <span className="block text-[10px] text-slate-400 font-normal">{item.notes}</span>}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400">
                        {item.quantityPer10People} {item.unit}
                      </td>
                      <td className="py-2.5 text-right font-mono font-extrabold text-sm text-amber-300">
                        {item.calculatedQuantity} {item.unit}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> {t("In Store", "સ્ટોકમાં")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Cooking Instructions Card */}
          <GlassCard className="p-5 space-y-3">
            <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-amber-400" />
              <span>{t("Preparation Instructions & Method", "બનાવવાની રીત અને સૂચનાઓ")}</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
              {(selectedRecipe?.preparationInstructions || []).map((step: string, sIdx: number) => (
                <li key={sIdx} className="pl-1">
                  <span className="font-medium text-slate-200">{step}</span>
                </li>
              ))}
            </ol>
          </GlassCard>
        </div>
      </div>

      {/* New Recipe Modal */}
      <Modal
        isOpen={newRecipeModalOpen}
        onClose={() => setNewRecipeModalOpen(false)}
        title={t("Add New Prasadi Recipe", "નવી પ્રસાદી રેસિપી ઉમેરો")}
        subtitle={t("Configure ingredients and standard proportions", "સામગ્રી અને પ્રમાણ નક્કી કરો")}
        maxWidth="md"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-400">Recipe creation form ready for Bhojanshala master catalog.</p>
          <Button size="md" className="w-full" onClick={() => setNewRecipeModalOpen(false)}>
            {t("Close", "બંધ કરો")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
