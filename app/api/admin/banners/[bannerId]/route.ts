// app/api/admin/banners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile, unlink } from "fs/promises";
import { createLog } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  context:{ params:Promise<{ bannerId: string }>}
) {
    const { params } =   context;
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const banner = await prisma.heroAd.findUnique({ where: { id: (await params).bannerId } });
    if (!banner) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ banner });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not fetch banner" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context:{ params:Promise<{ bannerId: string }>}
) {
    const { params } =   context;
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const isAdvertising = formData.get("isAdvertising") === "true";

    const newImageFile = formData.get("image") as File | null;

    if (!isAdvertising && (!title || !categoryId)) {
      return NextResponse.json({ error: "العنوان والرابط مطلوبين" }, { status: 400 });
    }
    // Fetch existing banner
    const existing = await prisma.heroAd.findUnique({ where: { id: (await params).bannerId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let imagePath = existing.image;
    if (newImageFile) {
      // delete old file
      const oldFull = path.join(process.cwd(), "public", existing.image);
      await unlink(oldFull).catch(() => { /* ignore */ });

      // save new file
      const buffer = Buffer.from(await newImageFile.arrayBuffer());
      const ext = path.extname(newImageFile.name);
      const filename = `${randomUUID()}${ext}`;
      const uploadPath = path.join(process.cwd(), "public", "banners", filename);
      await writeFile(uploadPath, buffer);
      imagePath = `/banners/${filename}`;
    }


    if(isAdvertising){
      const banner = await prisma.heroAd.update({where:{id:(await params).bannerId},data:{
        image:imagePath,
        isAdvertising:isAdvertising,
        title:"",
        categoryId:"",
        link:""
      }})
        await createLog({
                           actionType: 'UPDATE',
                           entityType: 'BANNER',
                           entityId: banner.id,
                           userId: session.user.id,
                           details: ` تم تعديل البانر : ${banner.title}`
                         });
        return NextResponse.json({ banner }, { status: 201 });

   }else{
       const category=await prisma.category.findFirst({where:{id:categoryId}})
       const banner = await prisma.heroAd.update({where:{id:(await params).bannerId},
         data: {
           title,
           link:`/categories/${category?.type}`,
           image: imagePath,
           categoryId:category?.id,
           isAdvertising:false
         },
       });
       await createLog({
        actionType: 'UPDATE',
        entityType: 'BANNER',
        entityId: banner.id,
        userId: session.user.id,
        details: ` تم تعديل البانر : ${banner.title}`
      });
       return NextResponse.json({ banner }, { status: 201 });
   }
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update banner" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context:{ params:Promise<{ bannerId: string }>}
) {
    const { params } =   context;

  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    // delete file from disk
    const existing = await prisma.heroAd.findUnique({ where: { id: (await params).bannerId } });
    if(!existing){
      return NextResponse.json({ error: "Could not delete banner" }, { status: 404 });
    }
    if ( existing?.image) {
      const fullPath = path.join(process.cwd(), "public", existing.image);
      await unlink(fullPath).catch(() => {});
    }

    await prisma.heroAd.delete({ where: { id: (await params).bannerId } });
    await createLog({
      actionType: 'UPDATE',
      entityType: 'BANNER',
      entityId: existing.id,
      userId: session.user.id,
      details: ` تم حذف البانر : ${existing.title}`
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete banner" }, { status: 500 });
  }
}
