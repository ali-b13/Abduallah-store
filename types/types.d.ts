// types.d.ts

import { Product, Currency } from '@prisma/client';

  
  // Response type for the home data API
  export interface HomePageData {
    heroAds: HeroAd[];
    bestSellers: Product[];
    categories: Category[];
    recommendedProducts: Product[];
  }

  export interface ProductWithCategoryProps extends Product {
    category:Category
    currency:Currency
  }