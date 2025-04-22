// components/ui/SkeletonProductCard.tsx
export function SkeletonProductCard() {
    return (
      <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
        {/* Image Skeleton */}
        <div className="aspect-square relative overflow-hidden rounded-t-xl">
          <div className="h-full w-full animate-pulse bg-gray-100 rounded-t-xl" />
        </div>
  
        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
          {/* Title and Cart Button */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded-md animate-pulse bg-gray-100" />
              <div className="h-4 w-1/2 rounded-md animate-pulse bg-gray-100" />
            </div>
            <div className="h-9 w-9 rounded-full animate-pulse bg-gray-100" />
          </div>
  
          {/* Price and Rating */}
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <div className="h-6 w-20 rounded-lg animate-pulse bg-gray-100" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-sm animate-pulse bg-gray-100" />
              <div className="h-4 w-12 rounded-md animate-pulse bg-gray-100" />
            </div>
          </div>
        </div>
  
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <div className="h-6 w-16 rounded-full animate-pulse bg-gray-100" />
        </div>
      </div>
    )
  }