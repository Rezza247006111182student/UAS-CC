import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';
import { formatCurrency } from '../../lib/utils';
import { ROUTES, SHIPPING_COST } from '../../lib/constants';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

export default function CartPage() {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const subtotal = items.reduce((sum, item) => sum + item.price_at_add * item.quantity, 0);
  const total = subtotal + SHIPPING_COST;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
          title="Keranjang Anda kosong"
          description="Temukan produk yang Anda suka dan tambahkan ke keranjang."
          action={
            <Link
              to={ROUTES.PRODUCTS}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Mulai Belanja
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => {
            const imgSrc = item.product.image_urls?.[0];
            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200">
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatCurrency(item.price_at_add)} / unit
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty stepper */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateItem.mutate({ id: item.id, quantity: item.quantity - 1 });
                          }
                        }}
                        disabled={item.quantity <= 1 || updateItem.isPending}
                        className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })
                        }
                        disabled={updateItem.isPending}
                        className="px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.price_at_add * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        disabled={removeItem.isPending}
                        className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">Ringkasan Pesanan</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ongkos Kirim</span>
                <span>{formatCurrency(SHIPPING_COST)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-2"
                onClick={() => navigate(ROUTES.CHECKOUT)}
              >
                Checkout
              </Button>

              <Link
                to={ROUTES.PRODUCTS}
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors mt-1"
              >
                Lanjut Belanja
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
