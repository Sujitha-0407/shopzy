function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-3">
        <div className="h-3 bg-gray-100 rounded mb-2 w-3/4" />
        <div className="h-3 bg-gray-100 rounded mb-3 w-1/2" />
        <div className="h-4 bg-gray-100 rounded mb-3 w-1/3" />
        <div className="h-8 bg-gray-100 rounded mb-1.5" />
        <div className="h-6 bg-gray-100 rounded" />
      </div>
    </div>
  )
}
export default SkeletonCard