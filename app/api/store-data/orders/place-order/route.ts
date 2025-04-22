// app/api/orders/place-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { ratelimit } from '@/lib/security/rate-limiter';
import validator from 'validator';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const userData = await authenticateUser(request)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!userData?.user?.id) {
    return NextResponse.json(
      { error: 'يجب تسجيل الدخول لإتمام الطلب' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findFirst({ where: { id: userData.user.id }});
  if (!user) {
    return NextResponse.json(
      { error: 'يجب تسجيل الدخول بطريقة صحيحة' },
      { status: 401 }
    );
  }

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { address, items } = body;

  if (!address || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: 'عنوان التوصيل وعناصر السلة مطلوبة' },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Validate products and calculate prices
      const validatedItems = await Promise.all(
        items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: {
              price: true,
              discount: {
                select: {
                  price: true,
                  isVaild: true
                }
              }
            }
          });

          if (!product) {
            throw new Error(`المنتج غير موجود: ${item.productId}`);
          }


          // Calculate final price
          const finalPrice = product.discount?.isVaild 
            ? product.discount.price 
            : product.price;

          return {
            productId: item.productId,
            quantity: item.quantity,
            price: finalPrice,
            originalPrice: product.price,
            discountApplied: product.discount?.isVaild || false
          };
        })
      );

      // Calculate total price
     

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          customerName:user.name,
          status: 'pending',
          statusHistory:{
            create:{
              status:"pending",
              userId:user.id
            }
          },
          address: validator.escape(address.trim()),
          products: {
            create: validatedItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,

            }))
          }
        },
        include: { products: true }
      });
      
      return newOrder;
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        ordersCount: { increment: 1 },
      }
    });
     await prisma.order.update({where:{id:order.id},data:{searchId:order.id}})
    return NextResponse.json(
      { 
        success: true, 
        orderId: order.id,
        message: 'تم تأكيد الطلب بنجاح'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Order placement error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'فشل إتمام الطلب، يرجى المحاولة لاحقاً';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}