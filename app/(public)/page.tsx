// app/(public)/page.tsx
import { CategoryShowcase } from "@/components/ui/sections/CategoryShowCase";
import { HeroSection } from "@/components/ui/sections/HeroSection";
import { ProductSwiper } from "@/components/ui/sections/ProductSwiper";

export default async function Home() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/store-data`,
      { cache: 'no-store', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac)"
        },
      },
    );

    if (!response.ok) return renderEmptyState();

    const { heroAds, bestSellers, categories, recommendedProducts } = 
      await response.json();

    // Check if all product-related data is empty
    const isEmptyStore = [bestSellers, recommendedProducts]
      .every(arr => arr.length === 0);

    return (
      <main>
        {isEmptyStore ? (
          renderEmptyState()
        ) : (
          <>
            <HeroSection ads={heroAds} />
            <ProductSwiper 
              title="أفضل المبيعات" 
              products={bestSellers} 
            />
            <CategoryShowcase 
              categories={categories} 
            />
            <ProductSwiper
              title="منتجات موصى بها"
              products={recommendedProducts}
            />
          </>
        )}
      </main>
    );
  } catch (error) {
    console.error('Home page error:', error);
    return renderErrorState();
  }
}

function renderEmptyState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl p-8">
        <div className="mb-8">
          <svg 
            className="mx-auto h-24 w-24 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          مرحباً بك في متجر عبدالله
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          المتجر قيد التجهيز، رجاءً تفقدنا لاحقاً
        </p>
      </div>
    </div>
  );
}

function renderErrorState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-red-500 p-8">
        <h2 className="text-2xl font-bold mb-4">
          حدث خطأ غير متوقع
        </h2>
        <p className="text-lg">
          تعذر تحميل بيانات المتجر، يرجى المحاولة مرة أخرى لاحقاً
        </p>
      </div>
    </div>
  );
}