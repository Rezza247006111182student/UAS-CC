import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Category, ProductFilters } from '../../types';

interface ProductFiltersProps {
  filters: ProductFilters;
  categories: Category[];
  onFilterChange: (filters: ProductFilters) => void;
}

export default function ProductFilters({ filters, categories, onFilterChange }: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearch = () => {
    onFilterChange({ ...filters, search: searchInput, page: 1 });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="flex items-center gap-2 flex-1 min-w-48 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Cari
        </button>
      </div>

      <select
        value={filters.category || ''}
        onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined, page: 1 })}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Semua Kategori</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>{cat.name}</option>
        ))}
      </select>

      <select
        value={filters.sort || 'newest'}
        onChange={(e) => onFilterChange({ ...filters, sort: e.target.value as ProductFilters['sort'], page: 1 })}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="newest">Terbaru</option>
        <option value="price-asc">Harga Terendah</option>
        <option value="price-desc">Harga Tertinggi</option>
        <option value="name">Nama A-Z</option>
      </select>
    </div>
  );
}
