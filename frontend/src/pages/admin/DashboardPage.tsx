import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import api from '../../lib/api';
import { formatCurrency, formatDate, generateOrderId } from '../../lib/utils';
import { ORDER_STATUS_LABELS } from '../../lib/constants';
import type { AdminStats, OrderStatus } from '../../types';

const REVENUE_PLACEHOLDER = [
  { date: '2026-11-18', revenue: 1200000 },
  { date: '2026-11-19', revenue: 1850000 },
  { date: '2026-11-20', revenue: 1100000 },
  { date: '2026-11-21', revenue: 2200000 },
  { date: '2026-11-22', revenue: 1750000 },
  { date: '2026-11-23', revenue: 2800000 },
  { date: '2026-11-24', revenue: 2100000 },
];

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> =
  {
    PENDING: 'warning',
    PROCESSING: 'info',
    SHIPPED: 'info',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatYAxis(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
  return String(value);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ success: boolean; data: AdminStats }>('/admin/stats')
      .then((res) => {
        setStats(res.data.data);
      })
      .catch(() => {
        setError('Gagal memuat statistik dashboard.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  const statCards = stats
    ? [
        {
          label: 'Total Pendapatan',
          value: formatCurrency(stats.totalRevenue),
          icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
          iconBg: 'bg-blue-50',
        },
        {
          label: 'Total Pesanan',
          value: stats.totalOrders.toLocaleString('id-ID'),
          icon: <ShoppingBag className="w-6 h-6 text-orange-500" />,
          iconBg: 'bg-orange-50',
        },
        {
          label: 'Total Produk',
          value: stats.totalProducts.toLocaleString('id-ID'),
          icon: <Package className="w-6 h-6 text-green-600" />,
          iconBg: 'bg-green-50',
        },
        {
          label: 'Total Pelanggan',
          value: stats.totalCustomers.toLocaleString('id-ID'),
          icon: <Users className="w-6 h-6 text-purple-600" />,
          iconBg: 'bg-purple-50',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan performa CloudMart</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`p-3 rounded-xl ${card.iconBg}`}>{card.icon}</div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Revenue 7 Hari Terakhir</h2>
        </CardHeader>
        <CardContent className="pt-2 pb-4">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={REVENUE_PLACEHOLDER} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label: string) => `Tanggal: ${label}`}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent orders */}
      {stats && stats.recentOrders && stats.recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Pesanan Terbaru</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    No. Pesanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs font-semibold text-gray-800">
                      {generateOrderId(order.id)}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={STATUS_VARIANT[order.status]}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
