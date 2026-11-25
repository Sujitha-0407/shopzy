import { useState } from 'react'

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative flex items-center bg-white rounded-full shadow-md overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-purple-400 transition-all">
        <span className="pl-4 text-gray-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="flex-1 px-3 py-3 outline-none text-sm text-gray-700"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 font-semibold text-sm hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar