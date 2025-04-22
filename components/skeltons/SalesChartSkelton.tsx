// components/skeletons/SalesChartSkeleton.tsx
import { motion } from 'framer-motion';

export const SalesChartSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm"
    >
      <div className="animate-pulse">
        {/* Title */}
        <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3 mb-4 sm:mb-6"></div>
        
        {/* Chart Area */}
        <div className="h-60 sm:h-80 bg-gray-100 rounded-lg sm:rounded-xl">
          <div className="flex justify-between items-end h-full px-2 sm:px-4 gap-1 sm:gap-2">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="h-full flex-1 max-w-[2.5rem] bg-gray-200 rounded-t"
              ></div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-12 sm:w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};