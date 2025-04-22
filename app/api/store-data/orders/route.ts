import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { ratelimit } from '@/lib/security/rate-limiter';
import { validateHeaders } from '@/lib/security/headers-validator';
import { authenticateUser } from '@/lib/auth';
import { calculateCurrencyTotals } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const userData = await authenticateUser(req);
  if (!userData.user?.id) {
    return NextResponse.json(
      { error: 'يرجى تسجيل الدخول أولاً', orders: [] },
      { status: 401 }
    );
  }

  // Rate limiting
  const identifier = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = await ratelimit.limit(identifier);
  if (!success) return new NextResponse("Too many requests", { status: 429 });

  // Header validation
  const securityCheck = await validateHeaders(req);
  if (!securityCheck.valid) {
    console.log("not valid")
    return NextResponse.json(
      { error: securityCheck.message },
      { status: securityCheck.statusCode }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: userData.user?.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        address: true,
        products: {
          include: {
            product: {
              include: {
                currency: true
              }
            }
          }
        },
        statusHistory:{
          
            orderBy: { timestamp: "desc" },
            include: { user: { select: { name: true } } }
        }
      }
    });

    // Calculate totals per currency for each order
    const processedOrders = orders.map(order => ({
      ...order,
      totals: calculateCurrencyTotals(order.products)
    }));

    return NextResponse.json({ orders: processedOrders || [] });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'فشل جلب الطلبات، يرجى المحاولة لاحقاً' },
      { status: 500 }
    );
  }
}