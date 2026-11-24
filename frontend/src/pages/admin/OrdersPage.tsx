import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from '../../components/ui/Table';
import api from '../../lib/api';
import { formatCurrency, formatDate, generateOrderId } from '../../lib/utils';
import { ORDER_STATUS_LABELS } from '../../lib/constants';
import type { Order, OrderStatus } from '../../types';

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Diproses', value: 'PROCESSING' },
  { label: 'Dikirim', value: 'SHIPPED' },
  { label: 'Diterima', value: 'DELIVERED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
];

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> =
  {
    PENDING: 'warning',
    PROCESSING: 'info',
    SHIPPED: 'info',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };

const ALL_STATUSES: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Order[]; pagination?: unknown }>('/admin/orders')
      .then((res) => setOrders(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setError('Gagal memuat pesanan.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch {
      alert('Gagal memperbarui status pesanan.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    activeTab === 'ALL' ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola semua pesanan pelanggan</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeadCell>No. Pesanan</TableHeadCell>
                <TableHeadCell>Tanggal</TableHeadCell>
                <TableHeadCell>Total</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Ubah Status</TableHeadCell>
              </tr>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-10">
                    Tidak ada pesanan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-semibold text-gray-800">
                      {generateOrderId(order.id)}
                    </TableCell>
                    <TableCell className="text-gray-500">{formatDate(order.created_at)}</TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[order.status]}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <select
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
