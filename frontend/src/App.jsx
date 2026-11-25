import { useState, useEffect } from 'react'
import CategoryBar from './components/CategoryBar'
import ProductCard from './components/ProductCard'
import CartPage from './components/CartPage'
import WishlistPage from './components/WishlistPage'
import ComparePage from './components/ComparePage'
import ProductDetail from './components/ProductDetail'
import HeroBanner from './components/HeroBanner'
import SkeletonCard from './components/SkeletonCard'
import LoginPage from './components/LoginPage'
import CheckoutPage from './components/CheckoutPage'
import OrderSuccessPage from './components/OrderSuccessPage'
import DealsPage from './components/DealsPage'
import OrdersPage from './components/OrdersPage'

const API = 'http://localhost:4001/api'

function App() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [compareList, setCompareList] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [notification, setNotification] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [orderData, setOrderData] = useState(null)
  const [orderForm, setOrderForm] = useState(null)
  const [orderTotal, setOrderTotal] = useState(0)

  const [page, setPage] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Load cart from DB when user logs in
  useEffect(() => {
    if (user && token) {
      fetch(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCart(data.map((item) => ({ ...item, quantity: item.quantity })))
          }
        })
        .catch((err) => console.error('Failed to load cart:', err))
    }
  }, [user, token])

  // Load categories
  useEffect(() => {
    fetch(`${API}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories:', err))
  }, [])

  // Load products
  useEffect(() => {
    setLoading(true)
    let url = `${API}/products`
    if (activeCategory) url = `${API}/products/category/${activeCategory}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let result = Array.isArray(data) ? data : [data]
        if (searchQuery) result = result.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        setProducts(result)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activeCategory, searchQuery])

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.discount ? Math.round(a.price - (a.price * a.discount) / 100) : parseFloat(a.price)
    const priceB = b.discount ? Math.round(b.price - (b.price * b.discount) / 100) : parseFloat(b.price)
    if (sortBy === 'price_asc') return priceA - priceB
    if (sortBy === 'price_desc') return priceB - priceA
    if (sortBy === 'discount') return (b.discount || 0) - (a.discount || 0)
    if (sortBy === 'stock') return a.stock - b.stock
    return a.product_id - b.product_id
  })

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 2500)
  }

  const handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setPage('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken('')
    setCart([])
    setWishlist([])
    setCompareList([])
    setActiveCategory(null)
    setSearchQuery('')
    setInputValue('')
    setSortBy('default')
    setPage('home')
  }

  const handleSearch = () => { setSearchQuery(inputValue.trim()); setActiveCategory(null) }
  const handleSelectCategory = (categoryId) => { setActiveCategory(categoryId); setSearchQuery(''); setInputValue('') }

  const handleAddToCart = async (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id)
      if (existing) return prev.map((i) => i.product_id === product.product_id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1 }]
    })
    showNotification(`${product.name} added to cart`)
    if (token) {
      try {
        await fetch(`${API}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: product.product_id, quantity: 1 }),
        })
      } catch (err) {
        console.error('Failed to save cart to DB:', err)
      }
    }
  }

  const handleRemoveFromCart = async (productId) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId))
    if (token) {
      try {
        await fetch(`${API}/cart/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (err) {
        console.error('Failed to remove from DB cart:', err)
      }
    }
  }

  const handleAddToWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((i) => i.product_id === product.product_id)
      if (exists) { showNotification('Removed from wishlist'); return prev.filter((i) => i.product_id !== product.product_id) }
      showNotification('Added to wishlist'); return [...prev, product]
    })
  }

  const handleAddToCompare = (product) => {
    setCompareList((prev) => {
      const exists = prev.find((i) => i.product_id === product.product_id)
      if (exists) return prev.filter((i) => i.product_id !== product.product_id)
      if (prev.length >= 3) { showNotification('Max 3 products to compare'); return prev }
      showNotification('Added to compare'); return [...prev, product]
    })
  }

  const handleViewDetail = (product) => { setSelectedProduct(product); setPage('detail') }

  const handleOrderSuccess = async (order, form, total) => {
    setOrderData(order); setOrderForm(form); setOrderTotal(total)
    setCart([])
    setPage('success')
    if (token) {
      try {
        await fetch(`${API}/cart`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (err) {
        console.error('Failed to clear DB cart:', err)
      }
    }
  }

  const handleViewDeals = () => {
    setSortBy('discount')
    setActiveCategory(null)
    setSearchQuery('')
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const pageBg = darkMode ? 'bg-gray-950 text-white' : 'bg-[#f8f7f4] text-gray-900'
  const selectStyle = darkMode
    ? 'bg-gray-900 text-white border-gray-700 text-xs'
    : 'bg-white text-gray-600 border-gray-200 text-xs'

  // Page routing
  if (!user) return <LoginPage onLogin={handleLogin} darkMode={darkMode} />
  if (page === 'cart') return <CartPage cart={cart} onBack={() => setPage('home')} onRemove={handleRemoveFromCart} onCheckout={() => setPage('checkout')} darkMode={darkMode} />
  if (page === 'checkout') return <CheckoutPage cart={cart} onBack={() => setPage('cart')} onOrderSuccess={handleOrderSuccess} token={token} user={user} darkMode={darkMode} />
  if (page === 'success') return <OrderSuccessPage order={orderData} form={orderForm} total={orderTotal} cart={orderData ? cart : []} onContinue={() => setPage('home')} darkMode={darkMode} />
  if (page === 'wishlist') return <WishlistPage wishlist={wishlist} onBack={() => setPage('home')} onRemove={(id) => setWishlist((p) => p.filter((i) => i.product_id !== id))} onAddToCart={handleAddToCart} darkMode={darkMode} />
  if (page === 'compare') return <ComparePage compareList={compareList} onBack={() => setPage('home')} onRemove={(id) => setCompareList((p) => p.filter((i) => i.product_id !== id))} onAddToCart={handleAddToCart} darkMode={darkMode} />
  if (page === 'detail') return <ProductDetail product={selectedProduct} onBack={() => setPage('home')} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} wishlist={wishlist} darkMode={darkMode} token={token} user={user} />
  if (page === 'orders') return <OrdersPage onBack={() => setPage('home')} token={token} darkMode={darkMode} />
  if (page === 'deals') return (
    <DealsPage
      onBack={() => setPage('home')}
      onAddToCart={handleAddToCart}
      onAddToWishlist={handleAddToWishlist}
      onAddToCompare={handleAddToCompare}
      onViewDetail={handleViewDetail}
      wishlist={wishlist}
      compareList={compareList}
      darkMode={darkMode}
    />
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-2.5 rounded text-xs font-semibold shadow-lg">
          {notification}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center gap-4 justify-between">

          {/* Logo */}
          <h1 className="text-base font-extrabold text-white tracking-widest flex-shrink-0 uppercase">
            Shopzy
          </h1>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded overflow-hidden flex-1 max-w-lg mx-4 focus-within:border-gray-500 transition-colors">
            <span className="pl-3 text-gray-600 text-sm">🔍</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for products..."
              className="flex-1 px-3 py-2.5 outline-none text-xs bg-transparent text-white placeholder-gray-600"
            />
            <button
              onClick={handleSearch}
              className="bg-white text-black px-4 py-2.5 font-semibold text-xs hover:bg-gray-100 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-500 hover:text-white transition-colors px-2 py-2 text-sm"
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <span className="hidden md:block text-gray-500 text-xs border border-gray-800 px-3 py-2 rounded">
              👤 {user.name.split(' ')[0]}
            </span>

            {/* My Orders button */}
            <button
              onClick={() => setPage('orders')}
              className="text-gray-500 hover:text-white transition-colors text-xs px-2 py-2 hidden md:block"
              title="My Orders"
            >
              📦 Orders
            </button>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors text-xs px-2 py-2"
            >
              Logout
            </button>

            <button
              onClick={() => setPage('wishlist')}
              className="relative text-gray-500 hover:text-white transition-colors px-2 py-2 text-sm"
              title="Wishlist"
            >
              ❤️
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setPage('compare')}
              className="relative text-gray-500 hover:text-white transition-colors px-2 py-2 text-sm"
              title="Compare"
            >
              🆚
              {compareList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-black text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setPage('cart')}
              className="relative bg-white text-black font-bold px-4 py-2 rounded text-xs hover:bg-gray-100 transition-colors"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <HeroBanner
        darkMode={darkMode}
        onShopNow={() => setPage('deals')}
        onViewDeals={handleViewDeals}
      />

      {/* ── CATEGORIES + PRODUCTS ── */}
      <div className="max-w-7xl mx-auto mt-5">

        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          darkMode={darkMode}
        />

        {/* Section Header */}
        <div
          id="products-section"
          className={`px-4 md:px-8 mt-8 flex items-center justify-between flex-wrap gap-3 mb-5 pb-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-0.5">
              {activeCategory
                ? categories.find((c) => c.category_id === activeCategory)?.category_name
                : searchQuery
                ? 'Search Results'
                : 'All Products'}
            </p>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {searchQuery ? `"${searchQuery}"` : activeCategory ? '' : 'Browse our collection'}
              <span className={`text-sm font-normal ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {sortedProducts.length} items
              </span>
            </h2>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`border rounded px-3 py-2 outline-none ${selectStyle}`}
          >
            <option value="default">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Best Discount</option>
            <option value="stock">Low Stock First</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="px-4 md:px-8 pb-16">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-semibold text-sm">No products found.</p>
              <p className="text-xs mt-1">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetail={handleViewDetail}
                  onAddToWishlist={handleAddToWishlist}
                  onAddToCompare={handleAddToCompare}
                  wishlist={wishlist}
                  compareList={compareList}
                  darkMode={darkMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App