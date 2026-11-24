import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Package } from 'lucide-react';
import { useOrder } from '../../hooks/useOrders';
import { formatCurrency, formatDate, generateOrderId } from '../../lib/utils';
import { ROUTES, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../lib/constants';
import Badge from '../../components/ui/Badge';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import type { OrderStatus, PaymentStatus } from '../../types';

const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'info' | 'warning' | 'success' | 'danger'
> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const PAYMENT_STATUS_VARIANT: Record<
  PaymentStatus,
  'default' | 'info' | 'warning' | 'success' | 'danger'
> = {
  PENDING: 'warning',
  SUCCESS: 'success',
  FAILED: 'danger',
  REFUNDED: 'info',
};

export default function OrderDetailPage() {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Pesanan tidak ditemukan</h2>
        <Link to={ROUTES.ORDERS} className="text-blue-600 hover:text-blue-700 text-sm mt-4 block">
          ← Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to={ROUTES.ORDERS} className="hover:text-blue-600 transition-colors">
          Pesanan
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{generateOrderId(order.id)}</span>
      </nav>

      <Link
        to={ROUTES.ORDERS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali ke Daftar Pesanan
      </Link>

      {/* Order header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {generateOrderId(order.id)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
        </div>
        <Badge
          variant={ORDER_STATUS_VARIANT[order.status]}
          className="text-sm px-4 py-1.5"
        >
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items table — full width */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">Item Pesanan</h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Produk
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Harga Satuan
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(order.items ?? []).map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.product?.name ?? `Produk #${item.product_id.substring(0, 8)}`}
                        </td>
                        <td className="px-4 py-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 bg-gray-50">
                      <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">
                        Subtotal
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(order.subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">
                        Ongkos Kirim
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(order.shipping_cost)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-blue-700 text-base">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment info */}
        {order.payment && (
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900">Informasi Pembayaran</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Metode</span>
                  <span className="font-medium text-gray-900">{order.payment.method}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={PAYMENT_STATUS_VARIANT[order.payment.status]}>
                    {PAYMENT_STATUS_LABELS[order.payment.status] ?? order.payment.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Jumlah</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.payment.amount)}
                  </span>
                </div>
                {order.payment.reference_code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kode Referensi</span>
                    <span className="font-mono text-xs text-gray-700">
                      {order.payment.reference_code}
                    </span>
                  </div>
                )}
                {order.payment.paid_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dibayar</span>
                    <span className="text-gray-900">{formatDate(order.payment.paid_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Shipping info */}
        {order.address && (
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900">Alamat Pengiriman</h2>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  {order.address.recipient_name}
                </p>
                <p className="text-sm text-gray-600">{order.address.phone}</p>
                <p className="text-sm text-gray-600">{order.address.street}</p>
                <p className="text-sm text-gray-600">
                  {order.address.city}, {order.address.province} {order.address.postal_code}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-gray-900">Catatan</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
