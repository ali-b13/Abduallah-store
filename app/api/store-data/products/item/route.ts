// app/api/store-data/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/database/prisma";
import { ratelimit } from "@/lib/security/rate-limiter";
import { validateHeaders } from "@/lib/security/headers-validator";
import { isMaliciousInput } from "@/lib/security/input-sanitizer";
import { createSecurityHeaders } from "@/lib/security/createSecureHeaders";
export async function GET(req: NextRequest) {
  try {
    // Get ID from query parameters
    const productId = req.nextUrl.searchParams.get("id");

    // Validate ID exists
    if (!productId || typeof(productId)!== "string") {
      return NextResponse.json(
        { error: "Missing product ID parameter" },
        { status: 400 }
      );
    }

    // Security validations required
    if (await isMaliciousInput(productId)) {
      return NextResponse.json(
        { error: "Invalid product identifier" },
        { status: 400 }
      );
    }

    // Rate limiting
    const identifier = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = await ratelimit.limit(identifier);
    if (!success) return new NextResponse("Too many requests", { status: 429 });

    // Header validation
    const securityCheck = await validateHeaders(req);
    if (!securityCheck.valid) {
      return NextResponse.json(
        { error: securityCheck.message },
        { status: securityCheck.statusCode }
      );
    }

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        currency:true,
        category: true,
        reviews: {
          include: { user: { select: { name: true } ,} },
          orderBy: { createdAt: "desc" }
        }
      }
    });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404, headers: createSecurityHeaders(req) }
      );
    }

    return NextResponse.json(
      { product },
      { headers: createSecurityHeaders(req) }
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}