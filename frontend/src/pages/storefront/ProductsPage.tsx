import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts, useCategories } from '../../hooks/useProducts';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import type { ProductFilters as Filters } from '../../types';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: Filters = {
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as Filters['sort']) || undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  };

  const { data, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.page]);

  function handleFilterChange(next: Filters) {
    const params = new URLSearchParams();
    if (next.category) params.set('category', next.category);
    if (next.search) params.set('search', next.search);
    if (next.sort) params.set('sort', next.sort);
    if (next.page && next.page > 1) params.set('page', String(next.page));
    setSearchParams(params);
  }

  function handlePage(page: number) {
    handleFilterChange({ ...filters, page });
  }

  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Katalog Produk</h1>

      <ProductFilters
        filters={filters}
        categories={categories ?? []}
        onFilterChange={handleFilterChange}
      />

      <ProductGrid products={data?.data} isLoading={isLoading} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Halaman {pagination.page} dari {pagination.totalPages} &mdash;{' '}
            {pagination.total} produk
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              onClick={() => handlePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
