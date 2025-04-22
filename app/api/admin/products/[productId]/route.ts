// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import path from "path";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
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



  export async function PUT(req: NextRequest,context:{ params:Promise<{ productId: string }>}) {
    const { params } =   context;

    const session = await authenticateUser(req);
  
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    try {
      const formData = await req.formData();
  
      const name = formData.get("name") as string;
      const price = parseFloat(formData.get("price") as string);
      const salePrice = parseFloat(formData.get("salePrice") as string);
      const description = (formData.get("description") as string) || "";
      const categoryId = formData.get("categoryId") as string;
      const currencyId = formData.get("currencyId") as string;
      const discountPrice = parseFloat(formData.get("discountPrice") as string);
    
      const existingImages = ((formData.get("existingImages") as string) || "")
        .split(",")
        .filter(Boolean);
  
      if (!name || isNaN(price) || isNaN(salePrice) || !categoryId || !currencyId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
  
      const currentProduct = await prisma.product.findUnique({
        where: { id: (await params).productId },
      });
  
      if (!currentProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
  
      const currentImages = currentProduct.images as string[];
      const imagesToDelete = currentImages.filter((img) => !existingImages.includes(img));
  
      await Promise.all(
        imagesToDelete.map(async (imgPath) => {
          const fullPath = path.join(process.cwd(), "public", imgPath);
          await unlink(fullPath).catch(console.error);
        })
      );
  
      // Process new images
      const images = formData.getAll("images") as File[];
      const newImagePaths = await Promise.all(
        images.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
  
          const ext = path.extname(file.name);
          const filename = `${randomUUID()}${ext}`;
          const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
  
          await writeFile(uploadPath, buffer);
  
          return `/uploads/${filename}`;
        })
      );
  
      const updatedProduct = await prisma.product.update({
        where: { id: (await params).productId },
        data: {
          name,
          price,
          salePrice,
          description,
          categoryId,
          currencyId,
          images: [...existingImages, ...newImagePaths],
        },
        include: {
          category: true,
          currency: true,
        },
      });
      if(discountPrice>0){
        await prisma.product.update({where:{id:updatedProduct.id},data:{
          discount:{
            price:discountPrice,
            isVaild:true
          }
        }})
      }
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

  