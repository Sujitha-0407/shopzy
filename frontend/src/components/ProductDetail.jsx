import { useState, useEffect } from 'react'

function ProductDetail({ product, onBack, onAddToCart, onAddToWishlist, wishlist, darkMode, token, user }) {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loadingReviews, setLoadingReviews] = useState(true)

  const originalPrice = parseFloat(product.price)
  const discount = product.discount || 0
  const discountedPrice = discount ? Math.round(originalPrice - (originalPrice * discount) / 100) : originalPrice
  const isWishlisted = wishlist.some((w) => w.product_id === product.product_id)
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const bg = darkMode ? 'bg-gray-950' : 'bg-[#f8f7f4]'
  const card = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500'
  const input = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
  const reviewBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'
  const border = darkMode ? 'border-gray-800' : 'border-gray-100'

  const imageUrl = product.image_url
    ? product.image_url
    : `https://placehold.co/400x300/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`

  useEffect(() => {
    fetch(`http://localhost:4001/api/reviews/${product.product_id}`)
      .then((res) => res.json())
      .then((data) => { setReviews(Array.isArray(data) ? data : []); setLoadingReviews(false) })
      .catch(() => setLoadingReviews(false))
  }, [product.product_id])

  const handleSubmitReview = async () => {
    if (!token) { setError('Please login to submit a review'); return }
    if (!newReview.comment) { setError('Please write a comment'); return }
    setError('')
    try {
      const res = await fetch('http://localhost:4001/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.product_id, ...newReview }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to submit review'); return }
      setReviews((prev) => [{ ...data, user_name: user?.name || 'You' }, ...prev])
      setNewReview({ rating: 5, comment: '' })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch { setError('Cannot connect to server.') }
  }

  const stars = (count) => '⭐'.repeat(Math.round(count))

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* Header */}
      <div className="bg-black px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
          ← Back
        </button>
        <h1 className="text-sm font-extrabold text-white uppercase tracking-widest">Product Details</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Product Info Card */}
        <div className={`border ${border} rounded-lg p-6 mb-5 flex flex-col md:flex-row gap-6 ${card}`}>

          {/* Image */}
          <div className="w-full md:w-72 flex-shrink-0">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = `https://placehold.co/400x300/1a1a1a/ffffff?text=${encodeURIComponent(product.name)}`
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="text-xl font-bold">{product.name}</h2>
              <button
                onClick={() => onAddToWishlist(product)}
                className="text-xl flex-shrink-0 hover:scale-110 transition-transform"
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">{stars(parseFloat(avgRating))}</span>
              <span className="font-bold text-sm">{avgRating}</span>
              <span className={`text-xs ${sub}`}>({reviews.length} reviews)</span>
            </div>

            {/* Description */}
            <p className={`text-sm mb-4 ${sub}`}>
              {product.description || 'Premium quality product.'}
            </p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-3xl font-extrabold" style={{ color: '#c4a35a' }}>
                ₹{discountedPrice.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <>
                  <span className={`text-lg line-through ${sub}`}>
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {discount > 0 && (
              <p className="text-sm text-emerald-600 font-semibold mb-3">
                You save ₹{(originalPrice - discountedPrice).toLocaleString('en-IN')}!
              </p>
            )}

            <p className="text-sm text-emerald-600 font-medium mb-6">
              ✓ {product.stock} in stock
            </p>

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => onAddToCart(product)}
                className="bg-black text-white px-8 py-3 rounded text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => onAddToWishlist(product)}
                className={`px-8 py-3 rounded text-xs font-bold border-2 transition-colors ${
                  isWishlisted
                    ? 'border-red-400 text-red-500 hover:bg-red-50'
                    : darkMode
                    ? 'border-gray-600 text-gray-300 hover:border-gray-400'
                    : 'border-gray-300 text-gray-600 hover:border-gray-500'
                }`}
              >
                {isWishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={`border ${border} rounded-lg p-6 ${card}`}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#c4a35a' }}>
            Customer Reviews ({reviews.length})
          </h3>

          {/* Reviews List */}
          {loadingReviews ? (
            <p className={`text-xs ${sub} mb-4`}>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className={`text-xs ${sub} mb-6`}>No reviews yet. Be the first to review!</p>
          ) : (
            <div className="flex flex-col gap-3 mb-6">
              {reviews.map((r) => (
                <div key={r.review_id || r.id} className={`p-4 rounded border ${reviewBg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs">{r.user_name || r.name}</span>
                    <span className={`text-xs ${sub}`}>{r.created_at?.split('T')[0] || r.date}</span>
                  </div>
                  <div className="text-sm mb-1">{'⭐'.repeat(r.rating)}</div>
                  <p className={`text-xs ${sub}`}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Write Review */}
          <div className={`border-t ${border} pt-5`}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c4a35a' }}>
              Write a Review
            </h4>

            {!token && (
              <div className={`border rounded px-4 py-3 text-xs font-medium mb-3 ${
                darkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-500'
              }`}>
                Please login to submit a review
              </div>
            )}

            {submitted && (
              <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded px-4 py-2.5 text-xs font-semibold mb-3">
                ✓ Review submitted successfully!
              </div>
            )}

            {error && (
              <div className="border border-red-200 bg-red-50 text-red-600 rounded px-4 py-2.5 text-xs font-semibold mb-3">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors ${input}`}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {'⭐'.repeat(r)} ({r} star{r !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Share your experience with this product..."
                rows={3}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors resize-none ${input}`}
              />

              <button
                onClick={handleSubmitReview}
                disabled={!token}
                className="bg-black text-white py-3 rounded text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-40"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetail
