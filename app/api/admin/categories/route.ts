// app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile } from "fs/promises";

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
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name  || !type || !imageFile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save image to public/uploads
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const ext = path.extname(imageFile.name);
    const filename = `${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "categories");
    const uploadPath = path.join(uploadDir, filename);

    await writeFile(uploadPath, buffer);

    const category = await prisma.category.create({
      data: {
        name,
        href :`/categories/${type}`,
        type,
        image: `/categories/${filename}`,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST create category error:", error);
    return NextResponse.json({ error: "Could not create category" }, { status: 500 });
  }
}
