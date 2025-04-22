export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-6">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i}
          className="relative overflow-hidden bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-sm transition-all"
        >
          {/* Shimmer overlay with RTL support */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-white via-gray-50/50 to-white via-50% to-90% rtl:bg-gradient-to-l" />
          
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon skeleton with consistent aspect ratio */}
            <div className="flex-shrink-0">
              <div className="aspect-square w-9 sm:w-10 rounded-lg bg-gray-100" />
            </div>

            {/* Text content with responsive adjustments */}
            <div className="flex-1 space-y-2.5 sm:space-y-3">
              <div className="h-3.5 sm:h-4 bg-gray-100 rounded-full w-[65%] sm:w-[55%]" />
              <div className="h-5 sm:h-6 bg-gray-100 rounded-full w-[45%] sm:w-[40%]" />
              {/* Secondary line with responsive visibility */}
              <div className="h-2.5 bg-gray-100 rounded-full w-[80%] opacity-0 sm:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Animated bottom border (all screens) */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-100/50 to-transparent rtl:bg-gradient-to-l">
            <div className="h-full w-full animate-border-pulse bg-gray-100/20" />
          </div>
        </div>
      ))}
    </div>
  );
}