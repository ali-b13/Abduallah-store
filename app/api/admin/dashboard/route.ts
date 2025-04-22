import { authenticateUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/database/prisma";

const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const GET = async (req: NextRequest) => {
  const session = await authenticateUser(req);
  if (!session || !session.user?.isAdmin) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    const [totalOrders, totalProducts, orders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({
        where: { status: { in: ['delivered'] } },
        include: {
          products: {
            include: {
              product: {
                include: {
                  currency: true
                }
              }
            }
          }
        }
      })
    ]);

    // Initialize data structures
    const currencyStats = {
      SAR: { revenue: 0, profit: 0 },
      YER: { revenue: 0, profit: 0 }
    };

    const monthlySales = Array.from({ length: 12 }, () => ({
      SAR: { sales: 0, profit: 0 },
      YER: { sales: 0, profit: 0 }
    }));

    // Process all orders
   // Update the monthly sales calculation block
orders.forEach(order => {
    const orderMonth = new Date(order.createdAt).getMonth(); // 0-11
    
    order.products.forEach(orderItem => {
      const currencyCode = orderItem.product.currency.code;
      const quantity = orderItem.quantity;
      const salePrice = orderItem.product.salePrice;
      const costPrice = orderItem.product.price;
  
      // Calculate financials
      const revenue = salePrice * quantity;
      const profit = (costPrice -salePrice ) * quantity;
  
      // Only process valid currencies
      if (currencyCode === 'SAR' || currencyCode === 'YER') {
        // Update currency stats
        currencyStats[currencyCode].revenue += revenue;
        currencyStats[currencyCode].profit += profit;
  
        // Update monthly sales with type-safe access
        monthlySales[orderMonth][currencyCode].sales += revenue;
        monthlySales[orderMonth][currencyCode].profit += profit;
      }
    });
  });
    // Format sales data for chart
    const salesData = arabicMonths.map((monthName, index) => ({
      month: monthName,
      currencies: {
        SAR: {
          sales: monthlySales[index].SAR.sales,
          profit: monthlySales[index].SAR.profit
        },
        YER: {
          sales: monthlySales[index].YER.sales,
          profit: monthlySales[index].YER.profit
        }
      }
    }));

    return new Response(JSON.stringify({
      statsData:{
        totalOrders,
       totalProducts,
       currencyStats:{
        sar:{revenue:currencyStats.SAR.revenue.toFixed(2),
        profit:currencyStats.SAR.profit.toFixed(2)}
       ,yer:{revenue:currencyStats.YER.revenue.toFixed(2)
        ,profit:currencyStats.YER.profit.toFixed(2)}
    },
      
      },
      salesData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Database error:", error);
    return new Response("Internal server error", { status: 500 });
  }
};