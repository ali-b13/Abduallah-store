// components/skeletons/SalesChartSkeleton.tsx
import { motion } from 'framer-motion';

export const SalesChartSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-80 bg-gray-100 rounded-xl">
          <div className="flex justify-between items-end h-full p-4 space-x-4">
            {/* Vertical Bars */}
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-full w-8 bg-gray-200 rounded-t"></div>
            ))}
          </div>
        </div>
        
        {/* Legend Skeleton */}
        <div className="mt-6 flex justify-end space-x-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};