'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Button } from "@/components/ui/Button";
import { Rating } from "@mui/material";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cartContext";
import { Category, Currency, Discount, Product, Review } from "@prisma/client";
import Reviews from "../sections/Reviews";
import { formatPrice } from "@/lib/utils";

interface ReviewWithUser extends Review {
  user: { name: string };
}

interface ProductWithDetails extends Product {
  category: Category;
  reviews: ReviewWithUser[];
  averageRating: number;
  currency:Currency
  discount:Discount
}

export interface SingleProductProps {
  product: ProductWithDetails;
}

const SingleProduct = ({ product }: SingleProductProps) => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [isMounted, setIsMounted] = useState(false);
  const hasDiscount = product.discount?.isVaild && product.discount.price > 0
  const finalPrice = hasDiscount ? product.discount?.price : product.price
  useEffect(() => {
    setIsMounted(true);
  }, []);


  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
        {/* 🔷 Fixed Image Gallery Section */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="relative aspect-square bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl shadow-2xl overflow-hidden group">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>

          {/* Thumbnail Carousel - Fixed Swiper */}
          <div className="px-4 relative h-[120px]">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              spaceBetween={16}
              slidesPerView={4}
              watchOverflow
              className="!overflow-visible"
              breakpoints={{
                320: { slidesPerView: 3 },
                640: { slidesPerView: 4 },
              }}
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index} className="!h-[100px]">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className={`block relative w-full h-full rounded-xl overflow-hidden transition-all transform ${
                      selectedImage === image
                        ? "ring-3 ring-primary ring-offset-2 scale-105"
                        : "hover:scale-95 grayscale hover:grayscale-0"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                </SwiperSlide>
              ))}
              
              {/* Custom Navigation Buttons */}
              <div className="swiper-button-prev !left-0 !text-primary after:!text-2xl"></div>
              <div className="swiper-button-next !right-0 !text-primary after:!text-2xl"></div>
            </Swiper>
          </div>
        </div>

        {/* 🔷 Product Details Section */}
        <div className="space-y-2 lg:space-y-4">
        <p className="text-3xl text-gray-800 font-extrabold font-amiri">{product.name}</p>
          {/* Product Header */}
        

          {/* Price Block */}
          <div className="p-2 py-4  text-start bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
             <div className="flex flex-col gap-1 font-amiri">
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold ${hasDiscount ? 'text-red-500' : 'text-primary'}`}>
                        {formatPrice(product.discount?.isVaild?finalPrice||0:product.price)} {product.currency.name}
                      </span>
                      {hasDiscount && (
                        <span className="text-gray-400 line-through text-sm">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className="text-green-600 text-sm font-medium">
                        وفر {formatPrice(product.price - (finalPrice||0))} {product.currency.name}
                      </span>
                    )}
                  </div>
        
          </div>

          {/* Description */}
          <p className=" text-lg text-gray-600 leading-relaxed border-l-4 border-primary-200 pl-4">
            {product.description}
          </p>
          <div className="flex items-center gap-4">
              <Rating
                value={product.averageRating}
                precision={0.5}
                readOnly
                size="large"
                className="[&>.MuiRating-icon]:text-2xl"
              />
              <span className="text-gray-500 text-lg">
                ({product.reviews.length} تقييم)
              </span>
            </div>

          {/* Add to Cart */}
          <Button
            onClick={() => addToCart({
              id: product.id,
              image: product.images[0],
              name: product.name,
              price: product.price,
              quantity: 1,
              currency:product.currency
            })}
            className="flex items-center gap-2 h-16 px-10 text-lg  hover:gap-4 transition-all bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 shadow-lg hover:shadow-xl"
          >
            <ShoppingCart className="w-6 h-6" />
            <span>أضف إلى السلة</span>
          </Button>
        </div>
      </div>
      
      {/* 🔷 Reviews Section */}
       {product.reviews.length>0&&<Reviews reviews={product.reviews}/>} 
    </div>
  );
};

export default SingleProduct;