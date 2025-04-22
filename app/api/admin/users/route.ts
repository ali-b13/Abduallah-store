// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";

export const GET = async (req: NextRequest) => {
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const searchParams = {
      search: url.searchParams.get("search") || "",
      page: parseInt(url.searchParams.get("page") || "1"),
      limit: parseInt(url.searchParams.get("limit") || "10"),
    };

    
    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
       where:{OR: [
        { name: { contains: searchParams.search, mode: "insensitive" } },
        { mobile: { contains: searchParams.search } }
      ],
      AND:[{id:{not:session.user.id}},{isAdmin:false}]
    },
        orderBy: { createdAt: "desc" },
        take: searchParams.limit,
        select: {
          isBlocked:true,
          id: true,
          name: true,
          mobile: true,
          ordersCount: true,
          lastLogin: true,
          createdAt: true
        }
      }),
      prisma.user.count({where:{
        isAdmin:false
      }})
    ]);

    // Get stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await prisma.$transaction([
      prisma.user.count({where:{isAdmin:false}}),
      prisma.user.count({
        where: { lastLogin: { gte: thirtyDaysAgo},isAdmin:false,isBlocked:false }
      }),
      prisma.user.count({
        where:{isAdmin:false}
      }),
      prisma.user.findMany({
        where:{isAdmin:false,ordersCount:{gte:1}},
        orderBy: { ordersCount: "desc" },
        take: 5,
        select: {
          name: true,
          ordersCount: true,
          mobile: true
        }
      })
    ]);

    return NextResponse.json({
      users,
      stats: {
        totalUsers: stats[0],
        totalActiveUsers: stats[1],
        totalPurchasingUsers: stats[2],
        topUsers: stats[3]
      },
      pagination: {
        total,
        page: searchParams.page,
        totalPages: Math.ceil(total / searchParams.limit)
      }
    });

  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};