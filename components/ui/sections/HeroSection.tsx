'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Image from 'next/image'
import { Button } from '../Button'
import { HeroAd } from '@prisma/client'
import { ArrowRightCircleIcon } from 'lucide-react'

export function HeroSection({ ads }: { ads: HeroAd[] }) {
  return (
    <section className="relative overflow-hidden shadow-2xl md:rounded-xl">
      <Swiper
        className="h-[70vh] w-full"
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: '!bg-primary',
          renderBullet: (index, className) =>
            `<span class="${className} bg-white/50 h-1.5 w-8 rounded-full transition-all duration-300"></span>`,
        }}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        loop
        speed={1000}
      >
        {ads.map((ad) => (
          <SwiperSlide key={ad.id} className="relative">
            <div className="relative h-[70vh] w-full">
              <Image
                src={ad.image}
                alt={ad.title||"Banner"}
                fill
                sizes="100vw"
                quality={100}
                className="object-cover object-center transform group-hover:scale-105 transition-transform duration-[10s] ease-out"
                priority
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent">
                <div className="container flex h-full items-start  flex-col justify-center p-6 lg:p-8">
                  <div className="max-w-2xl space-y-8 relative z-10">
                    <h2 className="text-5xl font-bold leading-[1.1] md:text-7xl lg:text-8xl  font-almarai">
                      <span className="text-red-500 bg-clip-text ">
                        {ad?.title}
                      </span>
                    </h2>
                  </div>
                  {
                ad.link && (
                  <Button
                    href={ad.link}
                    className="group mt-4  bg-primary backdrop-blur-lg rounded-full border border-red-500 hover:bg-red-900 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white">استكشف اكثر</span>
                      <ArrowRightCircleIcon className="w-6 h-6 text-white transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                    
                    {/* Optional: Add hover effect background */}
                    <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent rounded-full" />
                    </div>
                  </Button>
                )
              }
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Styles */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 1.5rem !important;
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .swiper-pagination-bullet {
          opacity: 1 !important;
          background: rgba(255,255,255,0.5) !important;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
          width: 24px;
          height: 4px;
          border-radius: 2px;
        }

        .swiper-pagination-bullet-active {
          background: #e63946 !important;
          width: 40px;
        }

        .swiper-button-next,
        .swiper-button-prev {
          background: rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(8px);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          
          &::after {
            font-size: 1.25rem;
            font-weight: 700;
            color: white;
          }
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(255,255,255,0.2) !important;
          transform: scale(1.05);
        }

        @keyframes light-sweep {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(200%) skewX(12deg); }
        }
      `}</style>
    </section>
  )
}