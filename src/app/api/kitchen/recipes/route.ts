import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { KitchenRecipe } from "@/models";
import { initialRecipes } from "@/lib/seedData";

export async function GET() {
  try {
    await connectDB();
    let rawRecipes = await KitchenRecipe.find({}).sort({ name: 1 });
    if (!rawRecipes || rawRecipes.length === 0) {
      rawRecipes = initialRecipes as any;
    }

    const recipes = rawRecipes.map((r: any) => ({
      id: r._id?.toString() || r.recipeCode,
      _id: r._id,
      code: r.recipeCode,
      recipeCode: r.recipeCode,
      name: r.name,
      gujaratiName: r.gujaratiName || "",
      category: r.category || "Main Course",
      description: r.description || "",
      prepTimeMinutes: r.prepTimeMinutes || 45,
      baseHeadcount: 10,
      ingredients: (r.ingredients || []).map((ing: any) => ({
        name: ing.name,
        gujaratiName: ing.gujaratiName || "",
        baseQuantity: ing.quantityPer10People ?? ing.baseQuantity ?? 1,
        quantityPer10People: ing.quantityPer10People ?? ing.baseQuantity ?? 1,
        unit: ing.unit || "kg",
        notes: ing.notes || "",
      })),
      instructions: r.preparationInstructions || [],
      preparationInstructions: r.preparationInstructions || [],
    }));

    return NextResponse.json({ success: true, count: recipes.length, recipes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      name,
      gujaratiName,
      category = "Main Course",
      description = "",
      prepTimeMinutes = 45,
      ingredients,
      instructions,
      preparationInstructions,
    } = body;

    if (!name || !ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "Recipe Name and Ingredients list are required." },
        { status: 400 }
      );
    }

    const count = await KitchenRecipe.countDocuments();
    const recipeCode = `RCP-${String(count + 1).padStart(2, "0")}`;

    const normalizedIngredients = ingredients.map((ing: any) => ({
      name: ing.name,
      gujaratiName: ing.gujaratiName || "",
      quantityPer10People: Number(ing.quantityPer10People ?? ing.baseQuantity ?? 1),
      unit: ing.unit || "kg",
      notes: ing.notes || "",
    }));

    const recipe = await KitchenRecipe.create({
      recipeCode,
      name,
      gujaratiName: gujaratiName || "",
      category,
      description,
      prepTimeMinutes,
      ingredients: normalizedIngredients,
      preparationInstructions: preparationInstructions || instructions || [],
    });

    return NextResponse.json({
      success: true,
      message: "Recipe created successfully",
      recipe: {
        id: recipe._id.toString(),
        recipeCode: recipe.recipeCode,
        name: recipe.name,
        gujaratiName: recipe.gujaratiName,
        baseHeadcount: 10,
        ingredients: recipe.ingredients,
        instructions: recipe.preparationInstructions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, recipeId, recipeCode, ...updates } = body;

    const identifier = id || recipeId || recipeCode;
    let recipe = null;
    if (identifier && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      recipe = await KitchenRecipe.findById(identifier);
    }
    if (!recipe && identifier) {
      recipe = await KitchenRecipe.findOne({
        $or: [{ recipeCode: identifier }, { name: new RegExp(identifier, "i") }],
      });
    }

    if (!recipe) {
      return NextResponse.json({ success: false, error: "Recipe not found." }, { status: 404 });
    }

    if (updates.ingredients) {
      updates.ingredients = updates.ingredients.map((ing: any) => ({
        name: ing.name,
        gujaratiName: ing.gujaratiName || "",
        quantityPer10People: Number(ing.quantityPer10People ?? ing.baseQuantity ?? 1),
        unit: ing.unit || "kg",
        notes: ing.notes || "",
      }));
    }

    if (updates.instructions && !updates.preparationInstructions) {
      updates.preparationInstructions = updates.instructions;
    }

    Object.assign(recipe, updates);
    await recipe.save();

    return NextResponse.json({
      success: true,
      message: "Recipe updated successfully",
      recipe,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
