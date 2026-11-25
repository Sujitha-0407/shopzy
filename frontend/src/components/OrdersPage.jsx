import { useState, useEffect } from 'react'

function OrdersPage({ onBack, token, darkMode }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const bg = darkMode ? 'bg-gray-950' : 'bg-[#f8f7f4]'
  const card = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500'
  const border = darkMode ? 'border-gray-800' : 'border-gray-100'

  useEffect(() => {
    fetch('http://localhost:4001/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const paymentLabels = {
    upi: 'UPI Payment', netbanking: 'Net Banking',
    card: 'Card Payment', cod: 'Cash on Delivery',
  }

  const trackingSteps = ['Order Placed', 'Order Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="bg-black px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
          ← Back
        </button>
        <h1 className="text-sm font-extrabold text-white uppercase tracking-widest">My Orders</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`border ${border} rounded-lg p-5 animate-pulse ${card}`}>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📦</p>
            <p className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No orders yet
            </p>
            <p className={`text-xs mb-6 ${sub}`}>Your placed orders will appear here</p>
            <button onClick={onBack}
              className="bg-black text-white px-6 py-2.5 rounded text-xs font-semibold hover:bg-gray-800 transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.order_id} className={`border ${border} rounded-lg overflow-hidden ${card}`}>

                {/* Order Header */}
                <div className={`flex items-center justify-between p-4 border-b ${border}`}>
                  <div>
                    <p className={`text-xs ${sub} mb-0.5`}>Order ID</p>
                    <p className="font-bold text-sm" style={{ color: '#c4a35a' }}>
                      #SHZ{String(order.order_id).padStart(6, '0')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${sub} mb-0.5`}>Date</p>
                    <p className="text-xs font-medium">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : order.order_date
                        ? new Date(order.order_date).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-black text-white px-3 py-1 rounded">
                    {order.status || 'Confirmed'}
                  </span>
                </div>

                {/* Order Details */}
                <div className={`p-4 border-b ${border} grid grid-cols-2 gap-4`}>
                  <div>
                    <p className={`text-xs ${sub} mb-1`}>Delivery To</p>
                    <p className="text-xs font-semibold">{order.delivery_name || 'N/A'}</p>
                    <p className={`text-xs ${sub} mt-0.5`}>{order.delivery_phone}</p>
                    {/* ✅ FIXED: using delivery_address (actual DB column name) */}
                    <p className={`text-xs ${sub} mt-0.5 line-clamp-2`}>
                      {order.delivery_address || order.address || 'N/A'}
                    </p>
                    {order.landmark && (
                      <p className={`text-xs ${sub}`}>Near: {order.landmark}</p>
                    )}
                  </div>
                  <div>
                    <p className={`text-xs ${sub} mb-1`}>Payment</p>
                    <p className="text-xs font-semibold">
                      {paymentLabels[order.payment_method] || order.payment_method}
                    </p>
                    <p className={`text-xs ${sub} mt-2`}>Total Amount</p>
                    <p className="text-base font-extrabold mt-0.5" style={{ color: '#c4a35a' }}>
                      ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Tracking */}
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c4a35a' }}>
                    Tracking Status
                  </p>

                  <div className="flex items-start justify-between relative">
                    {/* Background line */}
                    <div className={`absolute top-2.5 left-0 right-0 h-0.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    {/* Progress line */}
                    <div
                      className="absolute top-2.5 left-0 h-0.5 bg-black transition-all duration-500"
                      style={{
                        width:
                          order.tracking_status === 'Order Placed' ? '0%'
                          : order.tracking_status === 'Order Confirmed' ? '25%'
                          : order.tracking_status === 'Shipped' ? '50%'
                          : order.tracking_status === 'Out for Delivery' ? '75%'
                          : order.tracking_status === 'Delivered' ? '100%'
                          : '0%'
                      }}
                    />

                    {trackingSteps.map((step, idx) => {
                      const currentIdx = trackingSteps.indexOf(order.tracking_status || 'Order Placed')
                      const isDone = idx < currentIdx
                      const isActive = idx === currentIdx

                      return (
                        <div key={step} className="flex flex-col items-center relative z-10" style={{ width: '20%' }}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold mb-1.5 ${
                            isDone
                              ? 'bg-black border-black text-white'
                              : isActive
                              ? 'bg-white border-black text-black'
                              : darkMode
                              ? 'bg-gray-900 border-gray-700'
                              : 'bg-white border-gray-200'
                          }`}>
                            {isDone ? '✓' : isActive ? '●' : ''}
                          </div>
                          <p className={`text-center leading-tight ${
                            isDone || isActive
                              ? `font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`
                              : sub
                          }`} style={{ fontSize: '9px' }}>
                            {step}
                          </p>
                          {isActive && (
                            <p style={{ fontSize: '8px', color: '#c4a35a' }} className="font-medium mt-0.5">
                              Active
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className={`mt-4 pt-3 border-t ${border} text-center`}>
                    <p className={`text-xs ${sub}`}>
                      Estimated Delivery:{' '}
                      <strong className={darkMode ? 'text-white' : 'text-gray-900'}>
                        {order.estimated_delivery
                          ? new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })
                          : '3–5 Business Days'}
                      </strong>
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage