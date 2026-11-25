function ProductCard({ product, onAddToCart, onViewDetail, onAddToWishlist, onAddToCompare, wishlist, compareList, darkMode }) {
  const originalPrice = parseFloat(product.price)
  const discount = product.discount || 0
  const discountedPrice = discount
    ? Math.round(originalPrice - (originalPrice * discount) / 100)
    : originalPrice

  const isBestSeller = product.stock < 30
  const isFeatured = product.product_id % 5 === 0
  const isWishlisted = wishlist?.some((w) => w.product_id === product.product_id)
  const isCompared = compareList?.some((c) => c.product_id === product.product_id)

  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const nameColor = darkMode ? 'text-gray-100' : 'text-gray-900'
  const subColor = darkMode ? 'text-gray-400' : 'text-gray-400'

  // ✅ FIXED: clean image URL with proper fallback
  const imageUrl = product.image_url
    ? product.image_url
    : `https://placehold.co/400x300/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`

  return (
    <div className={`${card} border rounded-lg overflow-hidden group flex flex-col hover:border-gray-300 transition-colors duration-200`}>

      {/* Image */}
      <div
        className="relative overflow-hidden bg-gray-50 cursor-pointer"
        style={{ height: '180px' }}
        onClick={() => onViewDetail(product)}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded">
              {discount}% OFF
            </span>
          )}
          {isBestSeller && (
            <span className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: '#c4a35a', color: '#ffffff' }}>
              BEST SELLER
            </span>
          )}
          {isFeatured && !isBestSeller && (
            <span className="bg-gray-800 text-gray-200 text-xs font-bold px-2 py-0.5 rounded">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToWishlist(product) }}
          className="absolute top-2 right-2 bg-white w-7 h-7 rounded flex items-center justify-center hover:scale-110 transition-transform shadow-sm text-sm"
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3
          className={`text-xs font-semibold mb-2 line-clamp-2 min-h-[32px] cursor-pointer hover:underline ${nameColor}`}
          onClick={() => onViewDetail(product)}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-base font-bold" style={{ color: '#c4a35a' }}>
            ₹{discountedPrice.toLocaleString('en-IN')}
          </span>
          {discount > 0 && (
            <span className={`text-xs line-through ${subColor}`}>
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {discount > 0 && (
          <p className="text-xs text-emerald-600 font-medium mb-2">
            Save ₹{(originalPrice - discountedPrice).toLocaleString('en-IN')}
          </p>
        )}

        <p className={`text-xs mb-3 ${subColor}`}>
          {product.stock} in stock
        </p>

        {/* Add to Cart */}
        <button
          onClick={() => onAddToCart(product)}
          className="mt-auto w-full bg-black text-white py-2 rounded text-xs font-semibold hover:bg-gray-800 transition-colors mb-1.5"
        >
          Add to Cart
        </button>

        {/* Compare */}
        <button
          onClick={() => onAddToCompare(product)}
          className={`w-full py-1.5 rounded text-xs font-medium border transition-colors ${
            isCompared
              ? 'border-black text-black bg-gray-50'
              : darkMode
              ? 'border-gray-700 text-gray-400 hover:border-gray-500'
              : 'border-gray-200 text-gray-400 hover:border-gray-400'
          }`}
        >
          {isCompared ? '✓ Comparing' : 'Compare'}
        </button>
      </div>
    </div>
  )
}
export default ProductCard