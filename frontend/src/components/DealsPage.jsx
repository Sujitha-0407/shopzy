import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import SkeletonCard from './SkeletonCard'

function DealsPage({ onBack, onAddToCart, onAddToWishlist, onAddToCompare, onViewDetail, wishlist, compareList, darkMode }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 59, seconds: 59 })

  const bg = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'
  const card = darkMode ? 'bg-gray-800' : 'bg-white'

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load discounted products
  useEffect(() => {
    fetch('http://localhost:4001/api/products')
      .then((res) => res.json())
      .then((data) => {
        const discounted = data.filter((p) => p.discount > 0)
          .sort((a, b) => b.discount - a.discount)
        setProducts(discounted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 px-8 py-4 flex items-center gap-4 shadow-lg">
        <button onClick={onBack} className="text-white font-bold text-lg hover:opacity-80">← Back</button>
        <h1 className="text-2xl font-extrabold text-white">🔥 Today's Deals</h1>
      </div>

      {/* Countdown Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 px-8 pb-8 pt-2">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/90 text-sm font-medium mb-3">⚡ Sale ends in</p>
          <div className="flex justify-center gap-4">
            {[
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map((t) => (
              <div key={t.label} className="text-center">
                <div className="bg-white text-red-600 font-extrabold text-3xl md:text-4xl w-16 md:w-20 h-16 md:h-20 rounded-2xl flex items-center justify-center shadow-lg">
                  {pad(t.value)}
                </div>
                <p className="text-white text-xs font-medium mt-1">{t.label}</p>
              </div>
            ))}
          </div>
          <p className="text-white font-bold text-lg mt-4">
            🎉 {products.length} products on sale right now!
          </p>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Top deals highlight */}
        {!loading && products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">👑 Best Deals Today</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {products.slice(0, 3).map((product) => {
                const originalPrice = parseFloat(product.price)
                const discountedPrice = Math.round(originalPrice - (originalPrice * product.discount) / 100)
                return (
                  <div
                    key={product.product_id}
                    onClick={() => onViewDetail(product)}
                    className={`${card} rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all border-2 border-orange-200 relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-orange-400 text-white text-xs font-extrabold px-3 py-1.5 rounded-bl-2xl">
                      {product.discount}% OFF
                    </div>
                    <img src={product.image_url} alt={product.name}
                      className="w-full h-36 object-cover rounded-xl mb-3" />
                    <h3 className="font-bold text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-extrabold text-lg">
                        ₹{discountedPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-green-600 text-xs font-semibold mt-1">
                      🎉 Save ₹{(originalPrice - discountedPrice).toLocaleString('en-IN')}!
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">🏷️ All Discounted Products</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 pb-12">
            {products.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToCart={onAddToCart}
                onViewDetail={onViewDetail}
                onAddToWishlist={onAddToWishlist}
                onAddToCompare={onAddToCompare}
                wishlist={wishlist}
                compareList={compareList}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DealsPage