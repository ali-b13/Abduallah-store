// app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile } from "fs/promises";
import { createLog } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const session = await authenticateUser(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const banners = await prisma.heroAd.findMany();
    return NextResponse.json({ banners });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not fetch banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    const session = await authenticateUser(req);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    try {
      const formData = await req.formData();
      const isAdvertising = formData.get("isAdvertising") === "true";
      const title = formData.get("title") as string;
      const categoryId = formData.get("categoryId") as string;
      const imageFile = formData.get("image") as File | null;
  
      if (!imageFile) {
        return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
      }
  
      if (!isAdvertising && (!title || !categoryId)) {
        return NextResponse.json({ error: "العنوان والرابط مطلوبين" }, { status: 400 });
      }

    // Save uploaded file
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const ext = path.extname(imageFile.name);
    const filename = `${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "banners");
    const uploadPath = path.join(uploadDir, filename);
    await writeFile(uploadPath, buffer);

     if(isAdvertising){
        const banner = await prisma.heroAd.create({
            data: {
              image: `/banners/${filename}`,
              isAdvertising:isAdvertising
            },
          });
          return NextResponse.json({ banner }, { status: 201 });

     }else{
         const category=await prisma.category.findFirst({where:{id:categoryId}})
         const banner = await prisma.heroAd.create({
           data: {
             title,
             link:`/categories/${category?.type}`,
             image: `/banners/${filename}`,
             categoryId:category?.id,
             isAdvertising:false
           },
         });

           await createLog({
                     actionType: 'CREATE',
                     entityType: 'BANNER',
                     entityId: banner.id,
                     userId: session.user.id,
                     details: ` تم اضافة بانر جديد: ${banner.title}`
                   });
         return NextResponse.json({ banner }, { status: 201 });
     }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create banner" }, { status: 500 });
  }
}
