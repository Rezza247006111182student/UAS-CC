import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { Cart, ApiResponse } from '../types';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const { setItems } = useCartStore();

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Cart>>('/cart');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (query.data?.items) {
      setItems(query.data.items);
    }
  }, [query.data, setItems]);

  return query;
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: string; quantity: number }) => {
      const res = await api.post('/cart/items', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; quantity: number }) => {
      const res = await api.patch(`/cart/items/${data.id}`, { quantity: data.quantity });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/cart/items/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
