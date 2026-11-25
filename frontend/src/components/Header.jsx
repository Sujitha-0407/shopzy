import SearchBar from './SearchBar'

function Header({ onSearch }) {
  return (
    <header className="bg-gradient-to-r from-purple-700 via-purple-600 to-blue-600 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          🛍️ <span>Shopzy</span>
        </h1>
        <SearchBar onSearch={onSearch} />
      </div>
    </header>
  )
}

export default Header