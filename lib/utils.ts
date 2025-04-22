// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price)
}








// orders uitls 

// lib/utils/order-utils.ts

interface CurrencyTotals {
  YER: number;
  SAR: number;
}

interface ProductWithCurrency {
  price: number;
  quantity: number;
  product: {
    currency: {
      code: string;
    };
  };
}

export function calculateCurrencyTotals(products: ProductWithCurrency[]): CurrencyTotals {
  return products.reduce((totals, item) => {
    const currencyCode = item.product.currency.code;
    const amount = item.price * item.quantity;
    
    if (currencyCode === 'YER') {
      totals.YER += amount;
    } else if (currencyCode === 'SAR') {
      totals.SAR += amount;
    }
    
    return totals;
  }, { YER: 0, SAR: 0 });
}