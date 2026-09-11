import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { KitchenRecipe } from "@/models";
import { initialRecipes } from "@/lib/seedData";

export async function GET() {
  try {
    await connectDB();
    let recipes = await KitchenRecipe.find({}).sort({ name: 1 });
    if (!recipes || recipes.length === 0) {
      recipes = initialRecipes as any;
    }
    return NextResponse.json({ success: true, count: recipes.length, recipes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, gujaratiName, category, description, prepTimeMinutes, ingredients, preparationInstructions } = body;

    if (!name || !ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "Recipe Name and Ingredients list are required." },
        { status: 400 }
      );
    }

    const count = await KitchenRecipe.countDocuments();
    const recipeCode = `REC-${String(count + 1).padStart(3, "0")}`;

    const recipe = await KitchenRecipe.create({
      recipeCode,
      name,
      gujaratiName: gujaratiName || "",
      category: category || "Main Course",
      description: description || "",
      prepTimeMinutes: prepTimeMinutes || 45,
      ingredients,
      preparationInstructions: preparationInstructions || [],
    });

    return NextResponse.json({ success: true, message: "Recipe created successfully", recipe });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
