"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Star, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/cartContext";
import Link from "next/link";
import { ProductWithCategoryProps } from "@/types/types";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ id, name, price, currency,discount, averageRating, images, category }: ProductWithCategoryProps) {
  const { addToCart } = useCart();
  const hasDiscount = discount?.isVaild && discount.price > 0
  const finalPrice = hasDiscount ? discount?.price : price
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative transform hover:-translate-y-1">
      {/* Image Container with Gradient Overlay */}
      <Link href={`/products/${id}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={images[0]}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />

          {/* Category Badge */}
          {category && (
            <span className="absolute top-3 left-3 px-3 py-1.5 bg-white/80 backdrop-blur-sm text-sm font-medium rounded-full shadow-sm">
              {category.name}
            </span>
          )}
        </div>
      </Link>

      {/* Quick Add Button (Floating) */}
      <button
        onClick={() => addToCart({ id, name, price, image: images[0], quantity: 1 ,currency:currency})}
        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
        aria-label="Add to cart"
      >
        <ShoppingCart className="w-5 h-5 text-gray-800" />
      </button>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Name and Rating */}
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-2 hover:text-primary-600 transition-colors ">
            {name}
          </h3>
          <div className="flex items-center gap-1 pl-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-gray-600">{averageRating}</span>
          </div>
        </div>

        {/* Price & Currency (Below Product Name) */}
         <div className="flex flex-col gap-1 font-amiri">
        <div className="flex items-center gap-3">
          <span className={`text-xl font-bold ${hasDiscount ? 'text-red-500' : 'text-primary'}`}>
            {formatPrice(discount?.isVaild?finalPrice||0:price)} {currency.name}
          </span>
          {hasDiscount && (
            <span className="text-gray-400 line-through text-sm">
              {formatPrice(price)}
            </span>
          )}
        </div>
        {hasDiscount && (
          <span className="text-green-600 text-sm font-medium">
            وفر {formatPrice(price - (finalPrice||0))} {currency.name}
          </span>
        )}
      </div>

        {/* Price and Main Add Button */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => addToCart({ id, name, price, image: images[0], quantity: 1 ,currency:currency})}
            className="rounded-lg   px-6 py-2 text-sm text-center flex items-center gap-2 font-medium shadow-sm hover:shadow-md transition-all transform   text-white hover:brightness-110 "
          >
            <Zap className="w-3 h-3  fill-current" />
            <span className="">أضف للسلة</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
