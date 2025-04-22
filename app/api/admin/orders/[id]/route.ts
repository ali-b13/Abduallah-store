// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { calculateCurrencyTotals } from "@/lib/utils";


enum OrderStatus {
  pending,
  confirmed,
  processing,
  delivered,
  declined
}
export async function GET(req: NextRequest,context:{ params:Promise<{ id: string }>} ) {
  const { params } =   context;
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: (await params).id },
      include: {
        products: {
          include: {
            product: {
             include:{currency:true}
            }
          }
        },
        user: { select: { name: true, mobile: true } },
        statusHistory: {
          orderBy: { timestamp: "desc" },
          include: { user: { select: { name: true } } }
        }
      }
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Calculate total
    const totals = calculateCurrencyTotals(order.products);
    return NextResponse.json({
      ...order,
      totals,
      phone: order.user.mobile
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { status, message } = body;

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await prisma.$transaction([
      prisma.order.update({
        where: { id: (await params).id },
        data: { status }
      }),
      prisma.statusHistory.create({
        data: {
          status,
          message,
          orderId: (await params).id,
          userId: session.user.id
        }
      })
    ]);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}