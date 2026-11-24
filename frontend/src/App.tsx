import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import StorefrontLayout from './components/layout/StorefrontLayout';
import AdminLayout from './components/layout/AdminLayout';
import CartDrawer from './components/cart/CartDrawer';
import { ToastProvider } from './components/ui/Toast';
import { useAuthStore } from './store/authStore';
import api from './lib/api';

// Storefront pages
import HomePage from './pages/storefront/HomePage';
import ProductsPage from './pages/storefront/ProductsPage';
import ProductDetailPage from './pages/storefront/ProductDetailPage';
import CartPage from './pages/storefront/CartPage';
import CheckoutPage from './pages/storefront/CheckoutPage';
import LoginPage from './pages/storefront/LoginPage';
import RegisterPage from './pages/storefront/RegisterPage';
import OrdersPage from './pages/storefront/OrdersPage';
import OrderDetailPage from './pages/storefront/OrderDetailPage';
import ProfilePage from './pages/storefront/ProfilePage';

// Admin pages
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import UsersPage from './pages/admin/UsersPage';
import PlatformPage from './pages/admin/PlatformPage';
import InfrastructurePage from './pages/admin/InfrastructurePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  useEffect(() => {
    const token = localStorage.getItem('cloudmart_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          useAuthStore.getState().setUser(res.data.data);
        })
        .catch(() => {
          // Token invalid or expired — the response interceptor in api.ts
          // handles the 401 case (clears token and redirects); no action needed here.
        });
    }
  }, []);

  return (
    <>
      <Routes>
        {/* Standalone auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public storefront */}
        <Route element={<StorefrontLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
        </Route>

        {/* Protected storefront */}
        <Route element={<ProtectedRoute />}>
          <Route element={<StorefrontLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin — ADMIN role required */}
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/platform" element={<PlatformPage />} />
            <Route path="/admin/infrastructure" element={<InfrastructurePage />} />
          </Route>
        </Route>
      </Routes>

      {/* Global cart drawer — rendered outside Routes so it persists across navigation */}
      <CartDrawer />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
