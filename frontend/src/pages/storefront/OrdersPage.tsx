import { Link } from 'react-router-dom';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency, formatDate, generateOrderId } from '../../lib/utils';
import { ROUTES, ORDER_STATUS_LABELS } from '../../lib/constants';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import type { OrderStatus } from '../../types';

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> =
  {
    PENDING: 'warning',
    PROCESSING: 'info',
    SHIPPED: 'info',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
          title="Belum ada pesanan"
          description="Pesanan yang Anda buat akan muncul di sini."
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Pesanan Saya</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_1fr_1.5fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>No. Pesanan</span>
          <span>Tanggal</span>
          <span>Jumlah</span>
          <span>Total</span>
          <span>Status</span>
          <span />
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-50">
          {orders.map((order) => {
            const itemCount = order.items?.length ?? 0;
            return (
              <div
                key={order.id}
                className="grid grid-cols-1 sm:grid-cols-[1.5fr_1.5fr_1fr_1.5fr_1fr_auto] gap-2 sm:gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {generateOrderId(order.id)}
                </span>
                <span className="text-sm text-gray-600">{formatDate(order.created_at)}</span>
                <span className="text-sm text-gray-600">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(order.total)}
                </span>
                <Badge variant={STATUS_VARIANT[order.status]}>
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </Badge>
                <Link
                  to={ROUTES.ORDER_DETAIL(order.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  Detail
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
