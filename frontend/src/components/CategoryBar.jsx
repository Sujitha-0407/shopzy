function CategoryBar({ categories, activeCategory, onSelectCategory, darkMode }) {
  const base = darkMode
    ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500'
    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
  const active = 'bg-black text-white border-black'

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-8 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex-shrink-0 px-4 py-2 rounded text-xs font-semibold border transition-all ${activeCategory === null ? active : base}`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.category_id}
          onClick={() => onSelectCategory(cat.category_id)}
          className={`flex-shrink-0 px-4 py-2 rounded text-xs font-semibold border transition-all whitespace-nowrap ${activeCategory === cat.category_id ? active : base}`}
        >
          {cat.icon} {cat.category_name}
        </button>
      ))}
    </div>
  )
}
export default CategoryBar