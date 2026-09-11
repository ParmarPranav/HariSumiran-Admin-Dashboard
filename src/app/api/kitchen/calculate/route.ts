import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { KitchenRecipe } from "@/models";
import { initialRecipes } from "@/lib/seedData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipeId, recipeCode, headcount = 100 } = body;

    await connectDB();

    let recipe = null;
    if (recipeId) {
      recipe = await KitchenRecipe.findById(recipeId);
    } else if (recipeCode) {
      recipe = await KitchenRecipe.findOne({ recipeCode });
    }

    if (!recipe) {
      // Fallback to initialRecipes
      recipe = initialRecipes.find((r) => r.recipeCode === recipeCode) || initialRecipes[0];
    }

    const scalingFactor = Math.max(1, headcount) / 10; // Base ratio is for 10 people

    const calculatedIngredients = (recipe.ingredients || []).map((ing: any) => {
      const calculatedQty = Number((ing.quantityPer10People * scalingFactor).toFixed(2));
      return {
        name: ing.name,
        gujaratiName: ing.gujaratiName,
        baseQuantityFor10: ing.quantityPer10People,
        calculatedQuantity: calculatedQty,
        unit: ing.unit,
        notes: ing.notes,
      };
    });

    return NextResponse.json({
      success: true,
      recipeName: recipe.name,
      gujaratiRecipeName: recipe.gujaratiName,
      headcount,
      ingredients: calculatedIngredients,
      preparationInstructions: recipe.preparationInstructions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
