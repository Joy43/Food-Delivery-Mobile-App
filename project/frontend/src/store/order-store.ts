import { create } from 'zustand';
import { api } from '@/lib/api-client';
import { Order } from '@food-delivery/types';

interface OrderState {
  customerOrders: Order[];
  driverActiveOrders: Order[];
  driverHistoryOrders: Order[];
  ownerOrders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchCustomerOrders: () => Promise<Order[]>;
  fetchOrderById: (id: string) => Promise<Order>;
  fetchDriverActiveOrders: () => Promise<Order[]>;
  fetchDriverHistoryOrders: () => Promise<Order[]>;
  fetchOwnerOrders: () => Promise<Order[]>;
  createOrder: (payload: any) => Promise<Order>;
  updateOrderStatus: (id: string, status: string) => Promise<Order>;
  acceptOrder: (id: string) => Promise<Order>;
}

export const useOrderStore = create<OrderState>((set) => ({
  customerOrders: [],
  driverActiveOrders: [],
  driverHistoryOrders: [],
  ownerOrders: [],
  currentOrder: null,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchCustomerOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Order[]>('/orders/mine');
      set({ customerOrders: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch orders', isLoading: false });
      throw err;
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Order>(`/orders/${id}`);
      set({ currentOrder: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch order', isLoading: false });
      throw err;
    }
  },

  fetchDriverActiveOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Order[]>('/orders/mine');
      const active = res.data.filter((o) => o.status === 'PICKED_UP');
      set({ driverActiveOrders: active, isLoading: false });
      return active;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch active orders', isLoading: false });
      throw err;
    }
  },

  fetchDriverHistoryOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Order[]>('/orders/mine');
      set({ driverHistoryOrders: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch order history', isLoading: false });
      throw err;
    }
  },

  fetchOwnerOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Order[]>('/orders/restaurant');
      set({ ownerOrders: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch restaurant orders', isLoading: false });
      throw err;
    }
  },

  createOrder: async (payload) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post<Order>('/orders', payload);
      set((state) => ({
        customerOrders: [res.data, ...state.customerOrders],
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to create order', isMutating: false });
      throw err;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.patch<Order>(`/orders/${id}/status`, { status });
      set((state) => ({
        currentOrder: state.currentOrder?.id === id ? res.data : state.currentOrder,
        ownerOrders: state.ownerOrders.map((o) => (o.id === id ? res.data : o)),
        driverActiveOrders: state.driverActiveOrders.map((o) => (o.id === id ? res.data : o)),
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update order status', isMutating: false });
      throw err;
    }
  },

  acceptOrder: async (id) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post<Order>(`/orders/${id}/accept`);
      set((state) => ({
        driverActiveOrders: [res.data, ...state.driverActiveOrders],
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to accept order', isMutating: false });
      throw err;
    }
  },
}));
