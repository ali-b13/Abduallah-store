'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { ProductCard } from '@/components/ui/product/ProductCard'
import { Search, ArrowUpDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SkeletonProductCard } from '@/components/skeltons/ProductSkelton'
import { ProductWithCategoryProps } from '@/types/types'
import { Category } from '@prisma/client'

const sortOptions = [
  { label: "الأحدث", value: "newest", icon: <ArrowUpDown className="w-4 h-4" /> },
  { label: "الأقدم", value: "oldest", icon: <ArrowUpDown className="w-4 h-4" /> },
  { label: "الأرخص", value: "lowest", icon: <ArrowUpDown className="w-4 h-4" /> },
  { label: "الأغلى", value: "highest", icon: <ArrowUpDown className="w-4 h-4" /> },
]


export default function ProductsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<ProductWithCategoryProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories,setcategories]=useState<Category[]>([])
  // Debounced API call
  useEffect(() => {
    const controller = new AbortController()
    console.log(selectedCategory,'selected')
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          search: searchTerm,
          sort: sortBy,
          category: selectedCategory === 'all' ? '' : selectedCategory,
        })
  
        // Create proper URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const url = new URL(`${apiUrl}/api/store-data/products`)
        url.search = params.toString()
  
        const response = await fetch(url.toString(), {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          cache: 'no-store'
        })
        
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        setProducts(data.products)
        setcategories(data.categories)
        setError('')
      } catch (err) {
        console.log(err)
        if (!controller.signal.aborted) {
          setError('فشل تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقًا.')
        }
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchProducts, 300)
    return () => {
      controller.abort()
      clearTimeout(debounceTimer)
    }
  }, [searchTerm, sortBy, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 w-full rounded-xl border-2 border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
              {/* Default All option */}
              <option 
                value="all" 
                className="text-gray-500 py-2 hover:bg-gray-50"
              >
                الكل
              </option>
              
              {categories && categories.map((option) => (
                <option 
                  key={option.id} 
                  value={option.type}
                  className="py-2 hover:bg-gray-50"
                >
                  {option.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <SkeletonProductCard  />
              <SkeletonProductCard  />
              <SkeletonProductCard  />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12 space-y-4">
          <div className="text-red-500 flex flex-col items-center">
            <RefreshCw className="w-12 h-12 mb-4 animate-spin" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            حاول مرة أخرى
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 space-y-4">
              <Search className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-xl text-gray-600">لا توجد منتجات متطابقة مع بحثك</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}