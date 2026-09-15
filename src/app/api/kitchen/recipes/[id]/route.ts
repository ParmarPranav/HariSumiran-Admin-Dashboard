import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { KitchenRecipe } from "@/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    let recipe = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      recipe = await KitchenRecipe.findById(id);
    }
    if (!recipe) {
      recipe = await KitchenRecipe.findOne({
        $or: [{ recipeCode: id }, { name: new RegExp(id, "i") }],
      });
    }

    if (!recipe) {
      return NextResponse.json({ success: false, error: "Recipe not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      recipe: {
        id: recipe._id.toString(),
        recipeCode: recipe.recipeCode,
        name: recipe.name,
        gujaratiName: recipe.gujaratiName || "",
        category: recipe.category,
        description: recipe.description,
        prepTimeMinutes: recipe.prepTimeMinutes,
        baseHeadcount: 10,
        ingredients: recipe.ingredients,
        instructions: recipe.preparationInstructions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    let recipe = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      recipe = await KitchenRecipe.findById(id);
    }
    if (!recipe) {
      recipe = await KitchenRecipe.findOne({
        $or: [{ recipeCode: id }, { name: new RegExp(id, "i") }],
      });
    }

    if (!recipe) {
      return NextResponse.json({ success: false, error: "Recipe not found." }, { status: 404 });
    }

    if (body.ingredients) {
      body.ingredients = body.ingredients.map((ing: any) => ({
        name: ing.name,
        gujaratiName: ing.gujaratiName || "",
        quantityPer10People: Number(ing.quantityPer10People ?? ing.baseQuantity ?? 1),
        unit: ing.unit || "kg",
        notes: ing.notes || "",
      }));
    }

    if (body.instructions && !body.preparationInstructions) {
      body.preparationInstructions = body.instructions;
    }

    Object.assign(recipe, body);
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    let deleted = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      deleted = await KitchenRecipe.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await KitchenRecipe.findOneAndDelete({ recipeCode: id });
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Recipe not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
