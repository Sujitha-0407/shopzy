import { useState } from 'react'

function CheckoutPage({ cart, onBack, onOrderSuccess, token, user, darkMode }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    landmark: '',
    paymentMethod: 'upi',
    upiId: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getDiscountedPrice = (item) =>
    item.discount ? Math.round(item.price - (item.price * item.discount) / 100) : parseFloat(item.price)
  const total = cart.reduce((sum, item) => sum + getDiscountedPrice(item) * item.quantity, 0)

  const bg = darkMode ? 'bg-gray-950' : 'bg-[#f8f7f4]'
  const card = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
  const input = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500'
  const border = darkMode ? 'border-gray-800' : 'border-gray-200'

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) { setError('Please fill in all required fields'); return }
    if (form.paymentMethod === 'upi' && !form.upiId) { setError('Please enter your UPI ID'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:4001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          total_amount: total,
          payment_method: form.paymentMethod,
          address: form.address,
          landmark: form.landmark,
          delivery_name: form.name,
          delivery_email: form.email,
          delivery_phone: form.phone,
          items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity, price: i.price, discount: i.discount })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Order failed'); setLoading(false); return }
      onOrderSuccess(data, form, total)
    } catch { setError('Cannot connect to server.') }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="bg-black px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-medium transition-colors">← Back</button>
        <h1 className="text-sm font-extrabold text-white uppercase tracking-widest">Checkout</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="border border-red-200 bg-red-50 text-red-600 rounded px-4 py-3 text-xs font-medium mb-4">
            {error}
          </div>
        )}

        {/* Delivery Details */}
        <div className={`border ${border} rounded-lg p-5 mb-4 ${card}`}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c4a35a' }}>
            Delivery Details
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { placeholder: 'Full Name *', key: 'name', type: 'text' },
              { placeholder: 'Email Address', key: 'email', type: 'email' },
              { placeholder: 'Phone Number *', key: 'phone', type: 'tel' },
            ].map((f) => (
              <input key={f.key} type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors ${input}`} />
            ))}
            <textarea placeholder="Full Address (House No, Street, City, State, Pincode) *" rows={3}
              value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors resize-none ${input}`} />
            <input type="text" placeholder="Nearest Landmark (optional)" value={form.landmark}
              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
              className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors ${input}`} />
          </div>
        </div>

        {/* Payment Method */}
        <div className={`border ${border} rounded-lg p-5 mb-4 ${card}`}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c4a35a' }}>
            Payment Method
          </h2>
          <div className="flex flex-col gap-2">
            {[
              { value: 'upi', label: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm' },
              { value: 'netbanking', label: 'Net Banking', desc: 'Pay via your bank account' },
              { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay' },
              { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
            ].map((method) => (
              <label key={method.value}
                className={`flex items-center gap-3 p-3.5 rounded border cursor-pointer transition-colors ${
                  form.paymentMethod === method.value
                    ? darkMode ? 'border-white bg-gray-800' : 'border-black bg-gray-50'
                    : `${border} hover:border-gray-400`
                }`}>
                <input type="radio" name="payment" value={method.value}
                  checked={form.paymentMethod === method.value}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="accent-black" />
                <div>
                  <p className="font-semibold text-xs">{method.label}</p>
                  <p className={`text-xs ${sub}`}>{method.desc}</p>
                </div>
              </label>
            ))}
            {form.paymentMethod === 'upi' && (
              <input type="text" placeholder="Enter UPI ID (e.g. name@upi)" value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors mt-1 ${input}`} />
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className={`border ${border} rounded-lg p-5 mb-5 ${card}`}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#c4a35a' }}>
            Order Summary
          </h2>
          {cart.map((item) => (
            <div key={item.product_id} className={`flex justify-between text-xs mb-2 ${sub}`}>
              <span>{item.name} × {item.quantity}</span>
              <span className="font-semibold">₹{(getDiscountedPrice(item) * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className={`border-t ${border} pt-3 mt-3 flex justify-between font-bold`}>
            <span className="text-sm">Total</span>
            <span className="text-base" style={{ color: '#c4a35a' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-black text-white py-3.5 rounded text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
          {loading ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  )
}
export default CheckoutPage