import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useAddToCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const addToCart = useAddToCart();

  const stock = product.inventory
    ? product.inventory.quantity - product.inventory.reserved_quantity
    : 0;
  const inStock = stock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <div className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {product.image_urls.length > 0 && !imgError ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200" />
        )}

        {/* Category badge */}
        {product.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="info">{product.category.name}</Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Name – 2-line clamp */}
        <h3
          className="text-sm font-medium text-gray-900 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-base font-bold text-gray-900">{formatCurrency(product.price)}</p>

        {/* Stock badge */}
        <div>
          <Badge variant={inStock ? 'success' : 'danger'}>
            {inStock ? 'Tersedia' : 'Habis'}
          </Badge>
        </div>

        {/* Add to cart button – pushed to bottom */}
        <div className="mt-auto pt-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={!inStock}
            loading={addToCart.isPending}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
            Tambah ke Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
}
