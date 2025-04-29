// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { createLog } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(req: NextRequest,context:{ params:Promise<{ productId: string }>} ) {
  const { params } =   context;
  const session = await authenticateUser(req);
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const product = await prisma.product.findFirst({where:{id:(await params).productId}})
    const curr= await prisma.currency.findMany()
    const currencies=curr.map(cr=>{
      return {
        label:cr.name,
        value:cr.id
      }
    })
    const cat=await prisma.category.findMany()

    const categories=cat.map(ct=>{
      return {
        label:ct.name,
        value:ct.id
      }
    })

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
     
    return NextResponse.json({
     product,
     categories,
     currencies
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest,context:{ params:Promise<{ productId: string }>} ) {
    const { params } =   context;
    const session = await authenticateUser(req);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    try {
      const product = await prisma.product.delete({where:{id:(await params).productId}})
  
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      await createLog({
        actionType: 'DELETE',
        entityType: 'PRODUCT',
        entityId: product.id,
        userId: session.user.id,
        details: `تم حذف المنتج: ${product.name}`
      });
      return NextResponse.json({
       success:true
      },{status:201});
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Internal server error", details: error instanceof Error ? error.message : "" },
        { status: 500 }
      );
    }
  }



  export async function PUT(req: NextRequest, context: { params: Promise<{ productId: string }> }) {
    const { params } = context;
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
        images // New array of Cloudinary URLs
      } = body;
  
      // Validation
      if (!name || isNaN(price) || isNaN(salePrice) || !categoryId || !currencyId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
  
      const currentProduct = await prisma.product.findUnique({
        where: { id: (await params).productId },
      });
  
      if (!currentProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
  
  

      // Update product with new images (this automatically replaces old images)
      const updatedProduct = await prisma.product.update({
        where: { id: (await params).productId },
        data: {
          name,
          price,
          salePrice,
          description,
          categoryId,
          currencyId,
          images: images, // This replaces the old array completely
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
        actionType: 'UPDATE',
        entityType: 'PRODUCT',
        entityId: updatedProduct.id,
        userId: session.user.id,
        details: `تم تعديل المنتج: ${updatedProduct.name}`
      });
  
      return NextResponse.json({ product: updatedProduct });
  
    } catch (error) {
      console.error("Error updating product:", error);
      return NextResponse.json(
        { error: "Internal server error", details: error instanceof Error ? error.message : "" },
        { status: 500 }
      );
    }
  }