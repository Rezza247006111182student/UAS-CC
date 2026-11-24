import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Order, ApiResponse } from '../types';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Order[]>>('/orders');
      return res.data.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      addressData: {
        recipientName: string;
        phone: string;
        street: string;
        city: string;
        province: string;
        postalCode: string;
      };
      paymentMethod: string;
      notes?: string;
    }) => {
      const res = await api.post<ApiResponse<Order>>('/orders', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
