import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";

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
    const body = await req.json();

    const {
      name,
      price,
      salePrice,
      description,
      categoryId,
      currencyId,
      discountPrice,
      images // Array of Cloudinary URLs from the frontend
    } = body;

    if (!name || isNaN(price) || isNaN(salePrice) || !categoryId || !currencyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        salePrice,
        description,
        categoryId,
        currencyId,
        images: images || [],
        discount: discountPrice > 0 ? {
          price: discountPrice,
          isVaild: true
        } : null
      },
      include: {
        category: true,
        currency: true,
      },
    });

    await createLog({
      actionType: 'CREATE',
      entityType: 'PRODUCT',
      entityId: newProduct.id,
      userId: session.user.id,
      details: `تم اضافة منتج جديد: ${newProduct.name}`
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