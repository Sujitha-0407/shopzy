function ComparePage({ compareList, onBack, onRemove, onAddToCart, darkMode }) {
  const bg = darkMode ? 'bg-gray-950' : 'bg-[#f8f7f4]'
  const card = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500'
  const border = darkMode ? 'border-gray-800' : 'border-gray-100'

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="bg-black px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">← Back</button>
        <h1 className="text-sm font-extrabold text-white uppercase tracking-widest">Compare Products</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {compareList.length < 2 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🆚</p>
            <p className="font-semibold text-sm mb-1">Add at least 2 products to compare</p>
            <p className={`text-xs mb-6 ${sub}`}>Click "Compare" on product cards to add them here</p>
            <button onClick={onBack} className="bg-black text-white px-6 py-2.5 rounded text-xs font-semibold hover:bg-gray-800 transition-colors">
              Browse Products
            </button>
          </div>
        ) : (
          <div className={`${card} border rounded-lg overflow-hidden`}>
            <div className={`grid border-b ${border}`} style={{ gridTemplateColumns: `180px repeat(${compareList.length}, 1fr)` }}>
              <div className={`p-4 text-xs font-bold uppercase tracking-widest ${sub} border-r ${border}`}>Feature</div>
              {compareList.map((p) => (
                <div key={p.product_id} className={`p-4 border-r ${border} text-center`}>
                  <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded mx-auto mb-2" />
                  <p className="font-semibold text-xs">{p.name}</p>
                  <button onClick={() => onRemove(p.product_id)} className={`text-xs ${sub} hover:text-red-500 mt-1`}>Remove</button>
                </div>
              ))}
            </div>

            {[
              { label: 'Price', render: (p) => {
                const disc = p.discount || 0
                const price = disc ? Math.round(p.price - (p.price * disc) / 100) : parseFloat(p.price)
                return <span style={{ color: '#c4a35a' }} className="font-bold">₹{price.toLocaleString('en-IN')}</span>
              }},
              { label: 'Discount', render: (p) => p.discount ? `${p.discount}% OFF` : '—' },
              { label: 'Stock', render: (p) => `${p.stock} units` },
              { label: 'Description', render: (p) => <span className={`text-xs ${sub}`}>{p.description || 'N/A'}</span> },
            ].map((row) => (
              <div key={row.label} className={`grid border-b ${border}`} style={{ gridTemplateColumns: `180px repeat(${compareList.length}, 1fr)` }}>
                <div className={`p-4 text-xs font-semibold border-r ${border} ${sub} uppercase tracking-wide`}>{row.label}</div>
                {compareList.map((p) => (
                  <div key={p.product_id} className={`p-4 text-xs text-center border-r ${border}`}>
                    {row.render(p)}
                  </div>
                ))}
              </div>
            ))}

            <div className={`grid`} style={{ gridTemplateColumns: `180px repeat(${compareList.length}, 1fr)` }}>
              <div className={`p-4 border-r ${border}`} />
              {compareList.map((p) => (
                <div key={p.product_id} className={`p-4 border-r ${border}`}>
                  <button onClick={() => onAddToCart(p)}
                    className="w-full bg-black text-white py-2 rounded text-xs font-bold hover:bg-gray-800 transition-colors">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default ComparePage