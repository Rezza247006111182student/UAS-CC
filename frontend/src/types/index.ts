export type UserRole = 'CUSTOMER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  category_id: string;
  category?: Category;
  image_urls: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  inventory?: { quantity: number; reserved_quantity: number };
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price_at_add: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  order_id: string;
  method?: string | null;
  status: PaymentStatus;
  amount: number;
  reference_code: string;
  paid_at?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes?: string | null;
  payment_method?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment | null;
  address?: Address | null;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name';
  page?: number;
  limit?: number;
}
