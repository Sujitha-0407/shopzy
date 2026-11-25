function WishlistPage({ wishlist, onBack, onRemove, onAddToCart, darkMode }) {
  const bg = darkMode ? 'bg-gray-950' : 'bg-[#f8f7f4]'
  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const text = darkMode ? 'text-white' : 'text-gray-900'
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500'
  const border = darkMode ? 'border-gray-800' : 'border-gray-100'

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      <div className="bg-black px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">← Back</button>
        <h1 className="text-sm font-extrabold text-white uppercase tracking-widest">Wishlist</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {wishlist.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🤍</p>
            <p className="font-semibold text-sm mb-1">Your wishlist is empty</p>
            <p className={`text-xs mb-6 ${sub}`}>Save products you love for later</p>
            <button onClick={onBack} className="bg-black text-white px-6 py-2.5 rounded text-xs font-semibold hover:bg-gray-800 transition-colors">
              Explore Products
            </button>
          </div>
        ) : (
          <div className={`border ${border} rounded-lg overflow-hidden`}>
            {wishlist.map((item) => {
              const originalPrice = parseFloat(item.price)
              const discount = item.discount || 0
              const discountedPrice = discount ? Math.round(originalPrice - (originalPrice * discount) / 100) : originalPrice
              return (
                <div key={item.product_id} className={`${card} border-b ${border} p-4 flex items-center gap-4 last:border-b-0`}>
                  <img src={item.image_url || 'https://via.placeholder.com/80'} alt={item.name}
                    className="w-16 h-16 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold" style={{ color: '#c4a35a' }}>₹{discountedPrice.toLocaleString('en-IN')}</span>
                      {discount > 0 && <span className={`text-xs line-through ${sub}`}>₹{originalPrice.toLocaleString('en-IN')}</span>}
                      {discount > 0 && <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded">{discount}% OFF</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onAddToCart(item)}
                        className="bg-black text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-800 transition-colors">
                        Add to Cart
                      </button>
                      <button onClick={() => onRemove(item.product_id)}
                        className={`text-xs ${sub} hover:text-red-500 transition-colors`}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default WishlistPage