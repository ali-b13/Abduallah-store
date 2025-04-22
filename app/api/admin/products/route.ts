import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import path from "path";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
import { Prisma } from "@prisma/client";
import { createLog } from "@/lib/logger";

export const GET = async (req: NextRequest) => {
  const session = await authenticateUser(req);
  if (!session || !session.user?.isAdmin) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const searchParams = {
      search: url.searchParams.get("search") || "",
      sort: url.searchParams.get("sort") || "latest",
      page: parseInt(url.searchParams.get("page") || "1"),
      limit: parseInt("10"),
    };

    // Build filter conditions dynamically using Prisma.ProductWhereInput
    const filters: Prisma.ProductWhereInput[] = [];
    if (searchParams.search) {
      filters.push({
        name: { contains: searchParams.search, mode: "insensitive" },
      });
    }
    const where: Prisma.ProductWhereInput = filters.length ? { AND: filters } : {};

    // Main query for products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          createdAt: searchParams.sort === "latest" ? "desc" : "asc",
        },
        skip: (searchParams.page - 1) * searchParams.limit,
        take: searchParams.limit,
        include: {
          currency: true,
          category:{select:{name:true,type:true}},
        },
      }),
      prisma.product.count({ where }),
      
    ]);

    return new Response(
      JSON.stringify({
        products,
        pagination: {
          total,
          page: searchParams.page,
          totalPages: Math.ceil(total / searchParams.limit),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
};


export async function POST(req: NextRequest) {
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const salePrice = parseFloat(formData.get("salePrice") as string);
    const description = (formData.get("description") as string) || "";
    const categoryId = formData.get("categoryId") as string;
    const currencyId = formData.get("currencyId") as string;
    const discountPrice = parseFloat(formData.get("discountPrice") as string);



    if (!name || isNaN(price) || isNaN(salePrice) || !categoryId || !currencyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Process new images
    const images = formData.getAll("images") as File[];
    const newImagePaths = await Promise.all(
      images.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const ext = path.extname(file.name);
        const filename = `${randomUUID()}${ext}`;
        const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

        await writeFile(uploadPath, buffer);

        return `/uploads/${filename}`;
      })
    );
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        salePrice,
        description,
        categoryId,
        currencyId,
        images: newImagePaths,
      },
      include: {
        category: true,
        currency: true,
      },
    });
    if(discountPrice>0){
      await prisma.product.update({where:{id:newProduct.id},data:{
        discount:{
          price:discountPrice,
          isVaild:true
        }
      }})
    }
      await createLog({
            actionType: 'CREATE',
            entityType: 'PRODUCT',
            entityId: newProduct.id,
            userId: session.user.id,
            details: ` تم اضافة منتج جديد: ${newProduct.name}`
          });

    return NextResponse.json({ product: newProduct }, { status: 201 });

  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}