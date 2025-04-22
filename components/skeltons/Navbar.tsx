const SkeletonNavBar = () => (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="hidden md:flex gap-8 items-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            ))}
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse md:hidden" />
          </div>
        </div>
      </div>
    </nav>
  )
  export default SkeletonNavBar