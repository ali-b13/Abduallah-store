// app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
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
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { title, categoryId, image, isAdvertising } = await req.json();

    // Validate required fields
    if (!image) {
      return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
    }

    if (!isAdvertising && (!title || !categoryId)) {
      return NextResponse.json({ error: "العنوان والرابط مطلوبين" }, { status: 400 });
    }

    // Validate image URL format
    if (typeof image !== "string" || !image.startsWith("http")) {
      return NextResponse.json({ error: "صورة غير صالحة" }, { status: 400 });
    }

    // For non-advertising banners, verify category exists
    let category = null;
    if (!isAdvertising) {
      category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
      }
    }

    // Create banner entry
    const bannerData = {
      image,
      isAdvertising,
      title: isAdvertising ? '' : title,
      categoryId: isAdvertising ? null : categoryId,
      link: isAdvertising ? null : `/categories/${category?.type}`
    };

    const banner = await prisma.heroAd.create({
      data: bannerData
    });

    // Create audit log
    await createLog({
      actionType: 'CREATE',
      entityType: 'BANNER',
      entityId: banner.id,
      userId: session.user.id,
      details: `تم اضافة بانر جديد: ${isAdvertising ? 'إعلان' : title}`
    });

    return NextResponse.json({ banner }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "فشل في إنشاء البانر" },
      { status: 500 }
    );
  }
}