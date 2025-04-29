// app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";

export async function GET(req: NextRequest) {
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json({ error: "Could not fetch categories" }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Parse JSON body instead of form data
    const { name, type, image } = await req.json();

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

    // Create category with Cloudinary URL
    const category = await prisma.category.create({
      data: {
        name,
        href: `/categories/${type}`,
        type,
        image: image, // Use the Cloudinary URL directly
      },
    });

    return NextResponse.json(
      { 
        category: {
          ...category,
        }
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("POST create category error:", error);
    return NextResponse.json(
      { error: "خطأ في إنشاء الفئة" },
      { status: 500 }
    );
  }
}