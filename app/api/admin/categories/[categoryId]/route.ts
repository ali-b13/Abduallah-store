// app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";

export async function GET(
  req: NextRequest,
  context:{ params:Promise<{ categoryId: string }>}
) {
    const { params } =   context;
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const category = await prisma.category.findUnique({ where: { id: (await params).categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ category });
  } catch (error) {
    console.error("GET category error:", error);
    return NextResponse.json({ error: "Could not fetch category" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  const { params } = context;
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { name, type, image } = await req.json();
    const categoryId = (await params).categoryId;

    // Validate required fields
    if (!name || !type || !image) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    // Validate image URL format
    if (typeof image !== "string" || !image.startsWith("http")) {
      return NextResponse.json(
        { error: "صورة غير صالحة" },
        { status: 400 }
      );
    }

    // Fetch existing category
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "الفئة غير موجودة" },
        { status: 404 }
      );
    }


    // Update category with new data
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        type,
        href: `/categories/${type}`,
        image
      }
    });

    return NextResponse.json(
      { category: updatedCategory },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT update category error:", error);
    return NextResponse.json(
      { error: "فشل في تحديث الفئة" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: NextRequest,
  context:{ params:Promise<{ categoryId: string }>}
) {
    const { params } =   context;
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const existing = await prisma.category.findUnique({ where: { id: (await params).categoryId },include:{products:true} });
    if(!existing){
      return NextResponse.json({ error: "Not_Found" }, { status: 404 });

    }
    if (existing.products.length > 0) {
      await prisma.product.deleteMany({
        where: { categoryId: existing.id }
      });
    }
   
    await prisma.category.delete({ where: { id: (await params).categoryId } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE category error:", error);
    return NextResponse.json({ error: "Could not delete category" }, { status: 500 });
  }
}
