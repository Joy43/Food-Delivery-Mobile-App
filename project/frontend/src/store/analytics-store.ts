import { create } from 'zustand';
import { api } from '@/lib/api-client';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: any[];
}

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: (restaurantId: string) => Promise<AnalyticsData>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchAnalytics: async (restaurantId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<AnalyticsData>(`/restaurants/${restaurantId}/analytics`);
      set({ data: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch analytics', isLoading: false });
      throw err;
    }
  },
}));
