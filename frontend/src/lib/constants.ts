export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    PLATFORM: '/admin/platform',
    INFRASTRUCTURE: '/admin/infrastructure',
  },
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  DELIVERED: 'Diterima',
  CANCELLED: 'Dibatalkan',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  SUCCESS: 'Berhasil',
  FAILED: 'Gagal',
  REFUNDED: 'Dikembalikan',
};

export const SHIPPING_COST = 15000;
