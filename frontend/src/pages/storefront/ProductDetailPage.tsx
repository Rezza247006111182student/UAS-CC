import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Package } from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
import { useAddToCart } from '../../hooks/useCart';
import { formatCurrency } from '../../lib/utils';
import { ROUTES } from '../../lib/constants';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function ProductDetailPage() {
  const { productId = '' } = useParams<{ productId: string }>();
  const { data: product, isLoading, isError } = useProduct(productId);
  const addToCart = useAddToCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const stock = product?.inventory
    ? product.inventory.quantity - product.inventory.reserved_quantity
    : 0;
  const inStock = stock > 0;

  function handleAddToCart() {
    if (!product || !inStock) return;
    addToCart.mutate({ productId: product.id, quantity });
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl bg-gray-200" />
          <div className="space-y-5">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Produk tidak ditemukan</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Produk yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  const images = product.image_urls ?? [];
  const displayImage = images[selectedImage];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        to={ROUTES.PRODUCTS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali ke Produk
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left — images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
            {displayImage && !imgError ? (
              <img
                src={displayImage}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                <Package className="w-20 h-20 text-blue-300" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedImage(idx); setImgError(false); }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx
                      ? 'border-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — details */}
        <div className="flex flex-col gap-5">
          {product.category && (
            <Badge variant="info">{product.category.name}</Badge>
          )}

          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <p className="text-3xl font-extrabold text-blue-700">
            {formatCurrency(product.price)}
          </p>

          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Badge variant={inStock ? 'success' : 'danger'}>
              {inStock ? `Tersedia (${stock} unit)` : 'Stok Habis'}
            </Badge>
          </div>

          {/* Quantity selector */}
          {inStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Jumlah:</span>
              <input
                type="number"
                min={1}
                max={stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(stock, Number(e.target.value))))
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Add to cart */}
          <Button
            variant="primary"
            size="lg"
            disabled={!inStock}
            loading={addToCart.isPending}
            onClick={handleAddToCart}
            className="mt-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {inStock ? 'Tambah ke Keranjang' : 'Stok Habis'}
          </Button>

          {addToCart.isSuccess && (
            <p className="text-sm text-green-600 font-medium">
              ✓ Produk berhasil ditambahkan ke keranjang
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
