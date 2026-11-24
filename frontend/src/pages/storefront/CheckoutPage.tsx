import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, MapPin, ShoppingBag, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useCreateOrder } from '../../hooks/useOrders';
import { formatCurrency } from '../../lib/utils';
import { ROUTES, SHIPPING_COST } from '../../lib/constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import type { Order } from '../../types';

const shippingSchema = z.object({
  recipientName: z.string().min(1, 'Nama penerima wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  street: z.string().min(1, 'Alamat jalan wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  postalCode: z.string().min(1, 'Kode pos wajib diisi'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const STEPS = [
  { id: 1, label: 'Informasi Pengiriman', icon: MapPin },
  { id: 2, label: 'Review Pesanan', icon: ShoppingBag },
  { id: 3, label: 'Pembayaran', icon: CreditCard },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items } = useCartStore();
  const createOrder = useCreateOrder();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'COD'>('TRANSFER');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate(ROUTES.LOGIN, { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (items.length === 0 && !createdOrder) navigate(ROUTES.CART, { replace: true });
  }, [items.length, createdOrder, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  const subtotal = items.reduce((sum, item) => sum + item.price_at_add * item.quantity, 0);
  const total = subtotal + SHIPPING_COST;

  function onShippingSubmit(data: ShippingFormData) {
    setShippingData(data);
    setCurrentStep(2);
  }

  async function handleConfirmOrder() {
    if (!shippingData) return;
    try {
      const order = await createOrder.mutateAsync({
        addressData: shippingData,
        paymentMethod,
      });
      setCreatedOrder(order);
    } catch {
      // error handled by mutation
    }
  }

  // Success state
  if (createdOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil Dibuat!</h2>
        <p className="text-gray-500 text-sm mb-2">
          Nomor pesanan Anda:
        </p>
        <p className="text-blue-600 font-bold text-lg mb-8">
          #{createdOrder.id.substring(0, 8).toUpperCase()}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={() => navigate(ROUTES.ORDERS)}>
            Lihat Pesanan
          </Button>
          <Button variant="outline" onClick={() => navigate(ROUTES.PRODUCTS)}>
            Lanjut Belanja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    step.id < currentStep ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Shipping Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Informasi Pengiriman</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
              <Input
                label="Nama Penerima"
                placeholder="Masukkan nama penerima"
                error={errors.recipientName?.message}
                {...register('recipientName')}
              />
              <Input
                label="Nomor Telepon"
                placeholder="Contoh: 08123456789"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Alamat Jalan"
                placeholder="Jl. Contoh No. 1"
                error={errors.street?.message}
                {...register('street')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Kota"
                  placeholder="Kota"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="Provinsi"
                  placeholder="Provinsi"
                  error={errors.province?.message}
                  {...register('province')}
                />
              </div>
              <Input
                label="Kode Pos"
                placeholder="Kode Pos"
                error={errors.postalCode?.message}
                {...register('postalCode')}
              />
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" size="lg">
                  Lanjut →
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Order */}
      {currentStep === 2 && shippingData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Produk yang Dipesan</h2>
            </CardHeader>
            <CardContent className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 flex-shrink-0">
                    {item.product.image_urls?.[0] && (
                      <img
                        src={item.product.image_urls[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {formatCurrency(item.price_at_add)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.price_at_add * item.quantity)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Alamat Pengiriman</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 font-medium">{shippingData.recipientName}</p>
              <p className="text-sm text-gray-500">{shippingData.phone}</p>
              <p className="text-sm text-gray-500">
                {shippingData.street}, {shippingData.city}, {shippingData.province}{' '}
                {shippingData.postalCode}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ongkos Kirim</span>
                  <span>{formatCurrency(SHIPPING_COST)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              ← Kembali
            </Button>
            <Button variant="primary" size="lg" onClick={() => setCurrentStep(3)}>
              Lanjut ke Pembayaran →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { value: 'TRANSFER', label: 'Transfer Bank' },
                { value: 'COD', label: 'Bayar di Tempat (COD)' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value as 'TRANSFER' | 'COD')}
                    className="accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">Ringkasan Pesanan</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{items.length} produk</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ongkos Kirim</span>
                  <span>{formatCurrency(SHIPPING_COST)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {createOrder.isError && (
            <p className="text-sm text-red-600">
              Gagal membuat pesanan. Silakan coba lagi.
            </p>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              ← Kembali
            </Button>
            <Button
              variant="primary"
              size="lg"
              loading={createOrder.isPending}
              onClick={handleConfirmOrder}
            >
              Konfirmasi Pesanan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
