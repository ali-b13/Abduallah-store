// app/(public)/page.tsx
import { CategoryShowcase } from "@/components/ui/sections/CategoryShowCase";
import { HeroSection } from "@/components/ui/sections/HeroSection";
import { ProductSwiper } from "@/components/ui/sections/ProductSwiper";

export default async function Home() {
  try {
    // Fetch data from the correct endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/store-data`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)',
          'Accept': 'application/json'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch store data');
    }
   
    const { 
      heroAds, 
      bestSellers, 
      categories, 
      recommendedProducts 
    } = await response.json();

    return (
      <main>
        <HeroSection ads={heroAds ?? []} />
        <ProductSwiper title="أفضل المبيعات" products={bestSellers ?? []} />
        <CategoryShowcase categories={categories ?? []} />
        <ProductSwiper 
          title="منتجات موصى بها" 
          products={recommendedProducts ?? []}
        />
      </main>
    );
  } catch (error) {
    console.error('Home page error:', error);
    return (
      <main>
        <div className="container py-8 text-center text-red-500">
          حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى لاحقًا
        </div>
      </main>
    );
  }
}