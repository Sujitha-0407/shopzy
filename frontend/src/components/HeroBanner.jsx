function HeroBanner({ darkMode, onShopNow, onViewDeals }) {
  const bg = darkMode ? '#111111' : '#0f0f0f'
  const sideBg1 = darkMode ? '#1a1630' : '#1a1630'
  const sideBg2 = darkMode ? '#0a1f14' : '#0a1f14'

  return (
    <div className="mx-4 md:mx-8 mt-6 mb-2 grid grid-cols-1 md:grid-cols-3 gap-3">

      {/* Main Banner */}
      <div
        className="col-span-2 relative overflow-hidden rounded-lg p-10 md:p-14"
        style={{ background: bg }}
      >
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Mega Sale Live Now
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Shop Smart,
          </h2>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight tracking-tight"
            style={{ color: '#c4a35a' }}>
            Save Bigger.
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-sm leading-relaxed">
            Up to 30% off on top brands. Free delivery on all orders above ₹2,000.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onShopNow}
              className="bg-white text-black font-semibold px-6 py-3 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              Shop Now →
            </button>
            <button
              onClick={onViewDeals}
              className="border border-gray-600 text-gray-300 font-semibold px-6 py-3 rounded text-sm hover:border-gray-400 hover:text-white transition-colors"
            >
              View Deals
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-5 text-9xl select-none">🛍</div>
      </div>

      {/* Side Banners */}
      <div className="flex flex-col gap-3">
        <div
          className="flex-1 rounded-lg p-6 cursor-pointer hover:opacity-90 transition-opacity relative overflow-hidden"
          style={{ background: sideBg1 }}
          onClick={onShopNow}
        >
          <p className="text-xs font-semibold tracking-widest text-purple-400 uppercase mb-2">
            New Arrivals
          </p>
          <h3 className="text-white font-bold text-lg leading-tight mb-3">
            Fashion<br />Collection
          </h3>
          <span className="text-xs font-semibold bg-purple-900 text-purple-300 px-3 py-1 rounded">
            Up to 15% OFF
          </span>
          <div className="absolute right-4 bottom-2 text-4xl opacity-20">👗</div>
        </div>

        <div
          className="flex-1 rounded-lg p-6 cursor-pointer hover:opacity-90 transition-opacity relative overflow-hidden"
          style={{ background: sideBg2 }}
          onClick={onViewDeals}
        >
          <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
            Electronics Sale
          </p>
          <h3 className="text-white font-bold text-lg leading-tight mb-3">
            Top Gadgets<br />& More
          </h3>
          <span className="text-xs font-semibold bg-emerald-900 text-emerald-300 px-3 py-1 rounded">
            Up to 10% OFF
          </span>
          <div className="absolute right-4 bottom-2 text-4xl opacity-20">📱</div>
        </div>
      </div>
    </div>
  )
}
export default HeroBanner