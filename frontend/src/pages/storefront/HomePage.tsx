import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Cpu,
  Smartphone,
  BookOpen,
  Home,
  Shirt,
  ArrowRight,
} from 'lucide-react';
import { useProducts, useCategories } from '../../hooks/useProducts';
import ProductGrid from '../../components/product/ProductGrid';
import { ROUTES } from '../../lib/constants';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  elektronik: <Cpu className="w-6 h-6" />,
  smartphone: <Smartphone className="w-6 h-6" />,
  buku: <BookOpen className="w-6 h-6" />,
  rumah: <Home className="w-6 h-6" />,
  fashion: <Shirt className="w-6 h-6" />,
};

function getIcon(slug: string): React.ReactNode {
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (slug.toLowerCase().includes(key)) return CATEGORY_ICONS[key];
  }
  return <ShoppingBag className="w-6 h-6" />;
}

export default function HomePage() {
  const { data: categoriesData, isLoading: catLoading } = useCategories();
  const { data: productsData, isLoading: prodLoading } = useProducts({ limit: 8 });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0F172A] to-[#1D4ED8] min-h-[500px] flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-blue-500/20 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-blue-400/30">
            Platform E-Commerce Cloud
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
            CloudMart
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-xl mx-auto">
            Belanja produk terbaik dengan infrastruktur cloud yang handal. Cepat, aman, dan
            terpercaya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTES.PRODUCTS}
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Mulai Belanja
            </Link>
            <Link
              to={ROUTES.ADMIN.INFRASTRUCTURE}
              className="inline-flex items-center justify-center gap-2 border border-blue-300 text-blue-100 font-semibold px-8 py-3 rounded-xl hover:bg-blue-800/40 transition-colors"
            >
              Lihat Infrastruktur
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Jelajahi Kategori</h2>
        {catLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(categoriesData ?? []).map((cat) => (
              <Link
                key={cat.id}
                to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <span className="text-blue-600 group-hover:scale-110 transition-transform">
                  {getIcon(cat.slug)}
                </span>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Produk Unggulan</h2>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid
          products={productsData?.data}
          isLoading={prodLoading}
        />
      </section>
    </div>
  );
}
