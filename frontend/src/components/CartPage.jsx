import { useState } from 'react'

function CartPage({ cart, onBack, onRemove, onCheckout, darkMode }) {
  const [appliedOffer, setAppliedOffer] = useState(null)

  const getDiscountedPrice = (item) =>
    item.discount ? Math.round(item.price - (item.price * item.discount) / 100) : parseFloat(item.price)

  const subtotal = cart.reduce((sum, item) => sum + getDiscountedPrice(item) * item.quantity, 0)

  const offers = [
    { code: 'SAVE5', label: '5% off on orders above ₹2,000', minOrder: 2000, discount: 5 },
    { code: 'SAVE10', label: '10% off on orders above ₹5,000', minOrder: 5000, discount: 10 },
    { code: 'SAVE15', label: '15% off on orders above ₹10,000', minOrder: 10000, discount: 15 },
  ]

  const handleApplyOffer = (offer) => {
    if (subtotal < offer.minOrder) return
    setAppliedOffer(appliedOffer?.code === offer.code ? null : offer)
  }

  const offerDiscount = appliedOffer ? Math.round((subtotal * appliedOffer.discount) / 100) : 0
  const total = subtotal - offerDiscount
  const nextOffer = offers.find((o) => subtotal < o.minOrder)

  const bg = darkMode ? 'bg-gray-950' : 'bg-[#f8f7f4]'
  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
  const text = darkMode ? 'text-white' : 'text-gray-900'
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500'
  const border = darkMode ? 'border-gray-800' : 'border-gray-100'

  return (
    <div className={`min-h-screen ${bg} ${text}`}>

      {/* Header */}
      <div className="bg-black px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
          ← Back
        </button>
        <h1 className="text-sm font-extrabold text-white uppercase tracking-widest">Your Cart</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-semibold text-sm mb-1">Your cart is empty</p>
            <p className={`text-xs mb-6 ${sub}`}>Add some products to get started</p>
            <button onClick={onBack} className="bg-black text-white px-6 py-2.5 rounded text-xs font-semibold hover:bg-gray-800 transition-colors">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className={`border ${border} rounded-lg overflow-hidden mb-5`}>
              {cart.map((item, idx) => {
                const discountedPrice = getDiscountedPrice(item)
                return (
                  <div key={item.product_id} className={`${card} border-b ${border} p-4 flex items-center gap-4 last:border-b-0`}>
                    <img src={item.image_url || 'https://via.placeholder.com/80'} alt={item.name}
                      className="w-16 h-16 object-cover rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold" style={{ color: '#c4a35a' }}>
                          ₹{discountedPrice.toLocaleString('en-IN')}
                        </span>
                        {item.discount > 0 && (
                          <>
                            <span className={`text-xs line-through ${sub}`}>₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                            <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded font-medium">{item.discount}% OFF</span>
                          </>
                        )}
                      </div>
                      <p className={`text-xs ${sub}`}>Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm mb-1">₹{(discountedPrice * item.quantity).toLocaleString('en-IN')}</p>
                      <button onClick={() => onRemove(item.product_id)}
                        className={`text-xs ${sub} hover:text-red-500 transition-colors`}>
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Offers */}
            <div className={`border ${border} rounded-lg p-5 mb-5 ${card}`}>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#c4a35a' }}>
                Available Offers
              </h2>
              <p className={`text-xs ${sub} mb-4`}>
                Subtotal: <strong>₹{subtotal.toLocaleString('en-IN')}</strong> — click Apply on any eligible offer
              </p>

              <div className="flex flex-col gap-2">
                {offers.map((offer) => {
                  const isEligible = subtotal >= offer.minOrder
                  const isApplied = appliedOffer?.code === offer.code
                  const savings = Math.round((subtotal * offer.discount) / 100)

                  return (
                    <div key={offer.code}
                      className={`flex items-center justify-between p-3.5 rounded border transition-all ${
                        isApplied
                          ? 'border-black bg-black text-white'
                          : isEligible
                          ? darkMode ? 'border-gray-700 hover:border-gray-500' : 'border-gray-200 hover:border-gray-400'
                          : darkMode ? 'border-gray-800 opacity-40' : 'border-gray-100 opacity-50'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-bold mb-0.5 ${isApplied ? 'text-white' : ''}`}>{offer.code}</p>
                        <p className={`text-xs ${isApplied ? 'text-gray-300' : sub}`}>{offer.label}</p>
                        {isEligible && (
                          <p className="text-xs font-medium mt-0.5" style={{ color: isApplied ? '#86efac' : '#c4a35a' }}>
                            Save ₹{savings.toLocaleString('en-IN')}
                          </p>
                        )}
                        {!isEligible && (
                          <p className={`text-xs mt-0.5 ${sub}`}>
                            Add ₹{(offer.minOrder - subtotal).toLocaleString('en-IN')} more to unlock
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleApplyOffer(offer)}
                        disabled={!isEligible}
                        className={`text-xs font-bold px-4 py-2 rounded transition-all flex-shrink-0 ${
                          isApplied
                            ? 'bg-white text-black hover:bg-gray-100'
                            : isEligible
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isApplied ? 'Remove' : isEligible ? 'Apply' : 'Locked'}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Progress bar */}
              {nextOffer && (
                <div className={`mt-4 pt-4 border-t ${border}`}>
                  <p className={`text-xs ${sub} mb-2`}>
                    Add ₹{(nextOffer.minOrder - subtotal).toLocaleString('en-IN')} more to unlock {nextOffer.discount}% off
                  </p>
                  <div className={`w-full rounded-full h-1.5 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((subtotal / nextOffer.minOrder) * 100, 100)}%`,
                        background: '#c4a35a'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className={`border ${border} rounded-lg p-5 ${card}`}>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c4a35a' }}>
                Order Summary
              </h2>

              <div className={`flex justify-between text-xs mb-2 ${sub}`}>
                <span>Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={`flex justify-between text-xs mb-2 ${sub}`}>
                <span>Delivery</span>
                <span className="text-emerald-500 font-medium">Free</span>
              </div>
              {appliedOffer && (
                <div className="flex justify-between text-xs mb-2 text-emerald-500 font-medium">
                  <span>{appliedOffer.code} ({appliedOffer.discount}% off)</span>
                  <span>−₹{offerDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className={`border-t ${border} pt-3 mt-3 flex justify-between font-bold`}>
                <span className="text-sm">Total</span>
                <span className="text-base" style={{ color: '#c4a35a' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>

              {appliedOffer && (
                <p className="text-xs text-emerald-500 font-medium mt-2 text-center">
                  You saved ₹{offerDiscount.toLocaleString('en-IN')} with {appliedOffer.code}
                </p>
              )}

              <button onClick={onCheckout}
                className="mt-5 w-full bg-black text-white py-3 rounded text-xs font-bold hover:bg-gray-800 transition-colors">
                Proceed to Checkout →
              </button>
              <button onClick={onBack}
                className={`mt-2 w-full py-2.5 rounded text-xs font-medium ${sub} hover:text-gray-700 transition-colors`}>
                ← Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage