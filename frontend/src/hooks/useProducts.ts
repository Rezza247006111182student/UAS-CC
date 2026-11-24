import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product, Category, PaginatedResponse, ApiResponse, ProductFilters } from '../types';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.sort) params.set('sort', filters.sort);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));
      const res = await api.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
      return res.data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories');
      return res.data.data;
    },
  });
}
