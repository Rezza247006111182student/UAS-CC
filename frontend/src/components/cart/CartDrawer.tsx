import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';
import { formatCurrency } from '../../lib/utils';
import { ROUTES } from '../../lib/constants';
import Button from '../ui/Button';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isOpen, closeCart, itemCount } = useCartStore();
  const { data: cart } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.price_at_add * item.quantity, 0);

  const handleCheckout = () => {
    navigate(ROUTES.CHECKOUT);
    closeCart();
  };

  const handleViewCart = () => {
    navigate(ROUTES.CART);
    closeCart();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-semibold text-gray-900">Keranjang</h2>
            {itemCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <ShoppingCart className="w-12 h-12 opacity-30" />
              <p className="text-sm font-medium">Keranjang masih kosong</p>
              <p className="text-xs text-center">Tambahkan produk dari katalog untuk memulai belanja</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const imgSrc = item.product.image_urls?.[0];
                return (
                  <li key={item.id} className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-200">
                      {imgSrc && (
                        <img
                          src={imgSrc}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(item.price_at_add)}</p>

                      {/* Qty stepper + subtotal */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateItem.mutate({ id: item.id, quantity: item.quantity - 1 });
                              }
                            }}
                            disabled={item.quantity <= 1 || updateItem.isPending}
                            className="px-2 py-1 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                            disabled={updateItem.isPending}
                            className="px-2 py-1 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.price_at_add * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem.mutate(item.id)}
                            disabled={removeItem.isPending}
                            className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-base font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>
            <Button variant="primary" size="md" className="w-full" onClick={handleCheckout}>
              Checkout
            </Button>
            <Button variant="outline" size="md" className="w-full" onClick={handleViewCart}>
              Lihat Keranjang
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
