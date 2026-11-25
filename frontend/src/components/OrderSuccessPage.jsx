function OrderSuccessPage({ order, form, total, cart, onContinue, darkMode }) {
  const bg = darkMode ? 'bg-gray-950' : 'bg-[#f8f7f4]'
  const card = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500'
  const border = darkMode ? 'border-gray-800' : 'border-gray-100'

  const paymentLabels = {
    upi: 'UPI Payment',
    netbanking: 'Net Banking',
    card: 'Card Payment',
    cod: 'Cash on Delivery',
  }

  const trackingSteps = [
    { label: 'Order Placed', done: true, active: false },
    { label: 'Order Confirmed', done: true, active: false },
    { label: 'Shipped', done: false, active: true },
    { label: 'Out for Delivery', done: false, active: false },
    { label: 'Delivered', done: false, active: false },
  ]

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-4 py-12`}>
      <div className="w-full max-w-md">

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
          <h1 className={`text-2xl font-extrabold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Order Confirmed
          </h1>
          <p className={`text-xs ${sub}`}>Thank you for shopping with Shopzy</p>
        </div>

        {/* Order Card */}
        <div className={`border ${border} rounded-lg overflow-hidden mb-4 ${card}`}>

          {/* Order ID */}
          <div className={`flex items-center justify-between p-4 border-b ${border}`}>
            <div>
              <p className={`text-xs ${sub} mb-0.5`}>Order ID</p>
              <p className="font-bold text-sm" style={{ color: '#c4a35a' }}>
                #SHZ{String(order.order_id).padStart(6, '0')}
              </p>
            </div>
            <span className="text-xs font-semibold bg-black text-white px-3 py-1 rounded">
              Confirmed
            </span>
          </div>

          {/* Items Ordered */}
          <div className={`p-4 border-b ${border}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${sub}`}>Items Ordered</p>
            {cart.map((item) => (
              <div key={item.product_id} className="flex items-center gap-3 mb-2 last:mb-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className={`text-xs ${sub}`}>Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Info */}
          <div className={`p-4 border-b ${border}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${sub}`}>Delivery To</p>
            <p className="text-xs font-semibold">{form.name}</p>
            <p className={`text-xs ${sub}`}>{form.phone}</p>
            <p className={`text-xs ${sub} mt-1`}>{form.address}</p>
            {form.landmark && <p className={`text-xs ${sub}`}>Near: {form.landmark}</p>}
          </div>

          {/* Payment & Total */}
          <div className={`p-4 border-b ${border} flex items-center justify-between`}>
            <div>
              <p className={`text-xs ${sub} mb-0.5`}>Payment</p>
              <p className="text-xs font-semibold">{paymentLabels[form.paymentMethod]}</p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${sub} mb-0.5`}>Total Paid</p>
              <p className="text-lg font-extrabold" style={{ color: '#c4a35a' }}>
                ₹{total.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Delivery Tracking */}
          <div className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c4a35a' }}>
              Delivery Tracking
            </p>

            {trackingSteps.map((step, idx) => (
              <div key={step.label} className="flex items-start gap-3">
                {/* Step indicator */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    step.done
                      ? 'bg-black border-black text-white'
                      : step.active
                      ? 'border-black bg-white text-black'
                      : darkMode
                      ? 'border-gray-700 bg-gray-800'
                      : 'border-gray-200 bg-white'
                  }`}>
                    {step.done ? '✓' : step.active ? '●' : ''}
                  </div>
                  {idx < trackingSteps.length - 1 && (
                    <div className={`w-0.5 h-5 mt-0.5 ${
                      step.done ? 'bg-black' : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>

                {/* Step label */}
                <div className="pb-4">
                  <p className={`text-xs font-semibold ${
                    step.done
                      ? darkMode ? 'text-white' : 'text-gray-900'
                      : step.active
                      ? darkMode ? 'text-white' : 'text-gray-900'
                      : sub
                  }`}>
                    {step.label}
                  </p>
                  {step.active && (
                    <p className="text-xs font-medium mt-0.5" style={{ color: '#c4a35a' }}>
                      In progress...
                    </p>
                  )}
                  {step.done && (
                    <p className={`text-xs mt-0.5 ${sub}`}>Completed</p>
                  )}
                </div>
              </div>
            ))}

            {/* Estimated delivery */}
            <div className={`mt-2 pt-3 border-t ${border} text-center`}>
              <p className={`text-xs ${sub}`}>
                Estimated Delivery:{' '}
                <strong className={darkMode ? 'text-white' : 'text-gray-900'}>
                  3–5 Business Days
                </strong>
              </p>
            </div>
          </div>

        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full bg-black text-white py-3.5 rounded text-xs font-bold hover:bg-gray-800 transition-colors"
        >
          Continue Shopping →
        </button>

      </div>
    </div>
  )
}

export default OrderSuccessPage