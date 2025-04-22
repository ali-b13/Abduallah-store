// app/categories/[category]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/database/prisma';
import { ProductCard } from '@/components/ui/product/ProductCard';

export const dynamic = 'force-static'; // Add this for static generation

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  // Destructure params first
  const  category  = (await params).category;

  // Fetch data after accessing params
  const [categoryData, products] = await Promise.all([
    prisma.category.findUnique({
      where: { type: category },
    }),
    prisma.product.findMany({
      where: { category: { type: category } },
      include: { currency: true, category: true },
    }),
  ]);

  if (!categoryData) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16 relative overflow-hidden rounded-3xl shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 opacity-95 z-0" />
          <div className="relative z-10 py-20 px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6 drop-shadow-xl font-cairo">
              {categoryData.name}
            </h1>
            <div className="inline-flex items-center justify-center space-x-4 ">
              <div className="h-1 w-16 bg-amber-300 rounded-full" />
              <p className="text-xl font-medium text-white italic font-noto-arabic">
                أشعل ستايلك
              </p>
              <div className="h-1 w-16 bg-amber-300 rounded-full" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 space-y-6">
            <div className="inline-flex bg-red-100 p-6 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-red-500"
                viewBox="0 0 24 24"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M13 8H7"/>
                <path d="M17 12H7"/>
              </svg>
            </div>
            <p className="text-2xl font-bold text-red-800 font-cairo">
              لا توجد منتجات
            </p>
            <p className="text-red-600 max-w-md mx-auto font-noto-arabic">
              هذا القسم فارغ حالياً، تفقدنا لاحقاً لمعرفة الجديد!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}