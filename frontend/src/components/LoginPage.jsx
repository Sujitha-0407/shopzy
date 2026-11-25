import { useState } from 'react'

function LoginPage({ onLogin, darkMode }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const bg = darkMode ? 'bg-gray-950' : 'bg-[#f8f7f4]'
  const card = darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
  const input = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500'

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    const url = isRegister ? 'http://localhost:4001/api/auth/register' : 'http://localhost:4001/api/auth/login'
    const body = isRegister
      ? { name: form.name, email: form.email, password: form.password, phone: form.phone }
      : { email: form.email, password: form.password }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin(data.user, data.token)
    } catch { setError('Cannot connect to server.') }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${bg}`}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className={`text-2xl font-extrabold tracking-widest uppercase ${darkMode ? 'text-white' : 'text-black'}`}>
            Shopzy
          </h1>
          <p className={`text-xs mt-2 ${sub}`}>Your one-stop e-commerce destination</p>
        </div>

        <div className={`border rounded-lg p-8 ${card}`}>
          <h2 className={`text-base font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className={`text-xs mb-6 ${sub}`}>
            {isRegister ? 'Sign up to start shopping' : 'Login to continue'}
          </p>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 rounded px-3 py-2.5 text-xs font-medium mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isRegister && (
              <input type="text" placeholder="Full Name *" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors ${input}`} />
            )}
            <input type="email" placeholder="Email Address *" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors ${input}`} />
            <input type="password" placeholder="Password *" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors ${input}`} />
            {isRegister && (
              <input type="tel" placeholder="Phone Number (optional)" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`border rounded px-4 py-2.5 text-xs outline-none focus:border-gray-400 transition-colors ${input}`} />
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="mt-5 w-full bg-black text-white py-3 rounded text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>

          <div className="mt-4 text-center">
            <button onClick={() => { setIsRegister(!isRegister); setError('') }}
              className={`text-xs font-medium hover:underline ${sub}`}>
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        <p className={`text-center text-xs mt-6 ${sub}`}>
          By continuing, you agree to Shopzy's Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}
export default LoginPage