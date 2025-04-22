'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Star } from 'lucide-react'
import { useCart } from '@/context/cartContext'
import Link from 'next/link'
import { ProductWithCategoryProps } from '../../../types/types';
import { formatPrice } from '@/lib/utils'
export function ProductSwiper({ title, products }: { title: string, products: ProductWithCategoryProps[] }) {
  const { addToCart } = useCart()


  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="group relative text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-12 md:mb-16">
          <span className="bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
            {title}
          </span>
          <span className="absolute bottom-0 left-1/2 w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 transform -translate-x-1/2 translate-y-2 rounded-full opacity-85 group-hover:w-32 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"></span>
        </h2>

        <Swiper
          spaceBetween={24}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.5 },
          }}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          className="!pb-14"
        >
          {products.map((product) => {
            const hasDiscount = product.discount?.isVaild && product.discount.price > 0
            const finalPrice = hasDiscount ? product.discount?.price : product.price
            
            return (
              <SwiperSlide key={product.id}>
                <div className="group select-none bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative">
                  {/* Discount Ribbon */}
                  {hasDiscount&&product.discount && (
                    <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                      {Math.round(
                        ((product.price - product.discount.price) / product.price) * 100 
                      )}% خصم
                    </div>
                  )}

                  <Link href={`/products/${product.id}`} className="block relative overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="p-5 ">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-800 font-amiri line-clamp-2 min-h-[4rem]">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 min-w-[70px]">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-600">
                          {product.averageRating}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col  gap-3">
                      <div className="flex flex-col gap-1 font-amiri">
                        <div className="flex items-center gap-3">
                          {hasDiscount && (
                            <span className="text-gray-400 line-through text-sm">
                              {formatPrice(product.price)}
                            </span>
                          )}
                          <span className={`text-xl font-bold ${hasDiscount ? 'text-red-500' : 'text-primary'}`}>
                            {formatPrice(product.discount?.isVaild?finalPrice||0:product.price)} {product.currency.name}
                          </span>
                        </div>
                        
                      </div>

                      <Button
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          price: finalPrice||0,
                          image: product.images[0],
                          quantity: 1,
                          currency:product.currency
                        })}
                        className="px-5 py-2.5 font-medium bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        أضف إلى السلة
                      </Button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </section>
  )
}