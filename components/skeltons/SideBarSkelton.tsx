// components/skeletons/DashboardSkeleton.tsx
'use client';
import { motion } from 'framer-motion';

export const SideBarSkelton = () => {
  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="animate-pulse"
      >
        {/* Title Skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-xl bg-gray-100 flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-80 bg-gray-100 rounded-xl"></div>
        </div>
      </motion.div>
    </div>
  );
};