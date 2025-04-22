import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/database/prisma";
import {  Product } from '@prisma/client';
import { ratelimit } from '@/lib/security/rate-limiter';
import { validateHeaders } from '@/lib/security/headers-validator';
import { isMaliciousInput } from '@/lib/security/input-sanitizer';
import { createSecurityHeaders } from '@/lib/security/createSecureHeaders';

const DEFAULT_FALLBACK = {
  heroAds: [],
  bestSellers: [],
  categories: [],
  recommendedProducts: [],
};

export const GET = async (req: NextRequest) => {
  const identifier = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const responseHeaders = createSecurityHeaders(req);

  try {
    // Rate limiting check
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return new NextResponse('Too many requests', { 
        status: 429,
        headers: responseHeaders
      });
    }

    // Security validation
    const securityCheck = await validateHeaders(req);
    if (!securityCheck.valid) {
      return NextResponse.json(
        { error: securityCheck.message },
        { 
          status: securityCheck.statusCode,
          headers: responseHeaders
        }
      );
    }

    // User validation
    const userId = req.headers.get('user-id');
    if (userId && (await isMaliciousInput(userId))) {
      return NextResponse.json(
        { error: 'Invalid user identifier' },
        { 
          status: 400,
          headers: responseHeaders
        }
      );
    }

    // Data fetching with error handling
    const [heroAds, categories] = await Promise.all([
      prisma.heroAd.findMany().catch(() => []),
      prisma.category.findMany({ take: 8 }).catch(() => []),
    ]);

    // Best sellers with fallbacks
    const bestSellers: Product[] = await fetchBestSellers().catch(() => []);

    // Recommendations with fallbacks
    const recommendedProducts: Product[] = userId ? 
      await fetchUserRecommendations(userId).catch(() => []) : 
      await fetchRandomProducts().catch(() => []);

    return NextResponse.json({
      heroAds: heroAds || [],
      bestSellers: bestSellers.length > 0 ? bestSellers : await fallbackProducts(),
      categories: categories || [],
      recommendedProducts: recommendedProducts.length > 0 ? recommendedProducts : await fallbackProducts(),
    }, { 
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(DEFAULT_FALLBACK, { 
      status: 500,
      headers: responseHeaders
    });
  }
};

// Helper functions
async function fetchBestSellers(): Promise<Product[]> {
  try {
    const bestSellerItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productIds = bestSellerItems.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { currency: true }
    });

    return productIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean) as Product[];
  } catch (error) {
    return await fallbackProducts();
  }
}

async function fetchUserRecommendations(userId: string): Promise<Product[]> {
  try {
    const userExists = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true }
    });
    if (!userExists) return [];

    const userOrders = await prisma.order.findMany({
      where: { userId },
      include: { products: { include: { product: true } } },
    });

    const purchasedIds = userOrders.flatMap(o => o.products.map(p => p.productId));
    if (purchasedIds.length === 0) return await fetchRandomProducts();

    const categories = await prisma.product.findMany({
      where: { id: { in: purchasedIds } },
      select: { categoryId: true },
    });

    const categoryIds = [...new Set(categories.map(c => c.categoryId))];
    return await prisma.product.findMany({
      where: { 
        categoryId: { in: categoryIds },
        id: { notIn: purchasedIds }
      },
      take: 10,
      include: { currency: true }
    });
  } catch (error) {
    return await fetchRandomProducts();
  }
}

async function fetchRandomProducts(): Promise<Product[]> {
  try {
    const productCount = await prisma.product.count();
    const skip = Math.floor(Math.random() * Math.max(0, productCount - 10));
    return await prisma.product.findMany({
      skip,
      take: 10,
      include: { currency: true }
    });
  } catch (error) {
    return [];
  }
}

async function fallbackProducts(): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      take: 5,
      include: { currency: true }
    });
  } catch (error) {
    return [];
  }
}