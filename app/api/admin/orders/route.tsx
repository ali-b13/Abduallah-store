import { authenticateUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/database/prisma";
import { OrderStatus, Prisma } from "@prisma/client";

export const GET = async (req: NextRequest) => {
    const session = await authenticateUser(req);
    if (!session || !session.user?.isAdmin) {
      return new Response("Unauthorized", { status: 403 });
    }
  
    try {
      const url = new URL(req.url);
      const searchParams = {
        search: url.searchParams.get('search') || '',
        status: url.searchParams.get('status') || 'all',
        sort: url.searchParams.get('sort') || 'latest',
        page: parseInt(url.searchParams.get('page') || '1'),
        limit: parseInt(url.searchParams.get('limit') || '10'),
      };
  
      // Build filter conditions dynamically
      const filters: Prisma.OrderWhereInput[] = [];
      if (searchParams.status !== 'all') {
        filters.push({ status: { equals: searchParams.status as OrderStatus  } });
      }
      if (searchParams.search) {
        filters.push({
          OR: [
            { customerName: { contains: searchParams.search, mode: 'insensitive' } },
            { searchId: { contains: searchParams.search, mode: 'insensitive' } },
          ]
        });
      }
      
      const where: Prisma.OrderWhereInput = filters.length ? { AND: filters } : {};
  
      // Main query
      const [orders, total, latestOrders] = await Promise.all([
        prisma.order.findMany({
          where ,
          orderBy: { createdAt: searchParams.sort === 'latest' ? "desc" : "asc" },
          skip: (searchParams.page - 1) * searchParams.limit,
          take: searchParams.limit,
          include: {
            products: {
              include: {
                product: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        }),
        prisma.order.count({ where }),
        prisma.order.findMany({
          where: { status: "pending" },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            products: {
              include: {
                product: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        }),
      ]);
  
      // Statistics queries
      const [confirmedCount, deliveredCount, newCount] = await Promise.all([
        prisma.order.count({ where: { status: 'confirmed' } }),
        prisma.order.count({ where: { status: 'delivered' } }),
        prisma.order.count({ where: { status: 'pending' } }),
      ]);
  
      return new Response(JSON.stringify({
        orders,
        latestOrders,
        orderStats: {
          confirmedOrders: confirmedCount,
          deliveredOrders: deliveredCount,
          newOrders: newCount,
        },
        pagination: {
          total,
          page: searchParams.page,
          limit: searchParams.limit,
          totalPages: Math.ceil(total / searchParams.limit),
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      }), { status: 500 });
    }
  };
  