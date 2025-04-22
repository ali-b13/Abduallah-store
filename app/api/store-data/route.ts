import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/database/prisma"
import { OrderItem, Product } from '@prisma/client';
import { ratelimit } from '@/lib/security/rate-limiter';
import { validateHeaders } from '@/lib/security/headers-validator';
import { isMaliciousInput } from '@/lib/security/input-sanitizer';
import { createSecurityHeaders } from '@/lib/security/createSecureHeaders';

export const GET = async (req: NextRequest) => {
  try {
    // Get IP address properly
  const identifier = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  
  // Rate limit check
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    return new NextResponse('Too many requests', { status: 429 });
  }
    // Security Layer 2: Request Validation
    const securityCheck = await validateHeaders(req);
    if (!securityCheck.valid) {
      return NextResponse.json(
        { error: securityCheck.message },
        { status: securityCheck.statusCode }
      );
    }

    // Security Layer 3: Input Validation
    const userId = req.headers.get('user-id');
    if (userId && (await isMaliciousInput(userId))) {
      return NextResponse.json(
        { error: 'Invalid user identifier' },
        { status: 400 }
      );
    }

    // Security Layer 4: CORS Protection
     const responseHeaders=createSecurityHeaders(req)


    // Fetch parallelizable data first with timeout
    const [heroAds, categories] = await Promise.all([
      Promise.race([
        prisma.heroAd.findMany(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]),
      prisma.category.findMany({ take: 8 }),
    ]);

    // Security Layer 5: Database Query Validation
    if (!Array.isArray(heroAds) || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Invalid data format received from database' },
        { status: 500, headers: responseHeaders }
      );
    }

    // Get best selling products with request timeout
    const bestSellerItems = await Promise.race([
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    const bestSellerProductIds = (bestSellerItems as OrderItem[]).map(item => item.productId);
    const bestSellerProducts = await prisma.product.findMany({
      where: { id: { in: bestSellerProductIds } },
      include:{currency:true}
    });

    // Order best sellers according to their sales rank
    const bestSellersMap = new Map(bestSellerProducts.map(p => [p.id, p]));
    let bestSellers = bestSellerProductIds
      .map(id => bestSellersMap.get(id))
      .filter(p => p) as Product[];

    // Fallback to oldest products if no best sellers
    if (bestSellers.length === 0) {
      bestSellers = await prisma.product.findMany({
        orderBy: { createdAt: 'asc' },
        take: 5,
        include:{currency:true}
      });
    }

    // Get recommended products with user validation
    let recommendedProducts: Product[] = [];
    if (userId) {
      // Security Layer 6: User Session Validation
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!userExists) {
        return NextResponse.json(
          { error: 'Invalid user session' },
          { status: 401, headers: responseHeaders }
        );
      }

      // Get user's purchased product categories
      const userOrders = await prisma.order.findMany({
        where: { userId },
        include: { products: { include: { product: true } } },
      });

      const purchasedProductIds = userOrders.flatMap(order => 
        order.products.map(item => item.productId)
      );

      if (purchasedProductIds.length > 0) {
        const userCategories = await prisma.product.findMany({
          where: { id: { in: purchasedProductIds } },
          select: { categoryId: true },
        });

        const categoryIds = [...new Set(userCategories.map(uc => uc.categoryId))];
        
        recommendedProducts = await prisma.product.findMany({
          where: { 
            categoryId: { in: categoryIds },
            id: { notIn: purchasedProductIds }
          },
          take: 10,
          include:{currency:true}
        });
      }
    }

    // Fallback to random products if no recommendations
    if (recommendedProducts.length === 0) {
      const productCount = await prisma.product.count();
      const skip = Math.floor(Math.random() * Math.max(0, productCount - 10));
      recommendedProducts = await prisma.product.findMany({
        skip,
        take: 10,
        include:{currency:true}
      });
    }

    return NextResponse.json({
      heroAds,
      bestSellers,
      categories,
      recommendedProducts,
    }, { 
      status: 200,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error fetching home page data:', error);
    // Security Layer 7: Generic Error Handling
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  }
}