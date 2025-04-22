'use client'

import { Category } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 xl:px-0">
      <h2 className="group relative text-5xl font-extrabold text-gray-900 text-center  mb-14">
      <span className=" bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent drop-shadow-md">
      تسوق حسب الفئة
      </span>
      <span className="absolute bottom-0 left-1/2 w-24 h-1 bg-gradient-to-r from-primary-400 to-primary-600 transform -translate-x-1/2 translate-y-2 rounded-full opacity-85 group-hover:w-32 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"></span>
    </h2>
          

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category: Category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative block rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-lg hover:shadow-xl"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${category.image}`}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/30 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end space-y-3">
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white/90 font-medium">تسوق الآن</span>
                    <span className="text-primary-400 transform -scale-x-100 text-xl">
                      ⟵
                    </span>
                  </div>
                </div>
                {/* Modern glass-morphism overlay */}
                <div className="absolute top-4 right-4 backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-full">
                  <span className="text-sm text-white font-medium">
                    اكتشف المزيد
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}