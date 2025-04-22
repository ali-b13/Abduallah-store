// app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile, unlink } from "fs/promises";

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
  context:{ params:Promise<{ categoryId: string }>}
) {
    const { params } =   context;
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const newImageFile = formData.get("image") as File | null;

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch existing category
    const existing = await prisma.category.findUnique({ where: { id: (await params).categoryId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let imagePath = existing.image;
    if (newImageFile) {
      // Delete old image
      const oldFull = path.join(process.cwd(), "public", existing.image);
      await unlink(oldFull).catch(() => {});

      // Save new image
      const buffer = Buffer.from(await newImageFile.arrayBuffer());
      const ext = path.extname(newImageFile.name);
      const filename = `${randomUUID()}${ext}`;
      const uploadPath = path.join(process.cwd(), "public", "categories", filename);
      await writeFile(uploadPath, buffer);

      imagePath = `/categories/${filename}`;
    }

    const updated = await prisma.category.update({
      where: { id: (await params).categoryId },
      data: { name, href:`/categories/${type}`, type:type, image: imagePath },
    });

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("PUT update category error:", error);
    return NextResponse.json({ error: "Could not update category" }, { status: 500 });
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
    if (existing?.image) {
      const fullPath = path.join(process.cwd(), "public", existing.image);
      await unlink(fullPath).catch(() => {});
    }
    await prisma.category.delete({ where: { id: (await params).categoryId } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE category error:", error);
    return NextResponse.json({ error: "Could not delete category" }, { status: 500 });
  }
}
