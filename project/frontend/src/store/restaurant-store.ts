import { create } from 'zustand';
import { api } from '@/lib/api-client';
import { RestaurantType } from '@food-delivery/types';

interface RestaurantState {
  restaurants: RestaurantType[];
  currentRestaurant: RestaurantType | null;
  myRestaurant: RestaurantType | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchRestaurants: (search?: string) => Promise<RestaurantType[]>;
  fetchRestaurantById: (id: string) => Promise<RestaurantType>;
  fetchMyRestaurant: () => Promise<RestaurantType | null>;
  createRestaurant: (data: Partial<RestaurantType>) => Promise<RestaurantType>;
  updateRestaurant: (id: string, data: Partial<RestaurantType>) => Promise<RestaurantType>;
  toggleOnline: (id: string, isOnline: boolean) => Promise<RestaurantType>;
  toggleOpen: (id: string, isOpen: boolean) => Promise<RestaurantType>;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurants: [],
  currentRestaurant: null,
  myRestaurant: null,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchRestaurants: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = search
        ? `/restaurants?search=${encodeURIComponent(search)}`
        : '/restaurants';
      const res = await api.get<RestaurantType[]>(endpoint);
      set({ restaurants: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to load restaurants',
        isLoading: false,
      });
      throw err;
    }
  },

  fetchRestaurantById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<RestaurantType>(`/restaurants/${id}`);
      set({ currentRestaurant: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to load restaurant details',
        isLoading: false,
      });
      throw err;
    }
  },

  fetchMyRestaurant: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<RestaurantType>('/restaurants/mine');
      set({ myRestaurant: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      if (err?.status === 404) {
        set({ myRestaurant: null, isLoading: false });
        return null;
      }
      set({
        error: err?.message || 'Failed to load my restaurant',
        isLoading: false,
      });
      throw err;
    }
  },

  createRestaurant: async (data) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post<RestaurantType>('/restaurants', data);
      set((state) => ({
        myRestaurant: res.data,
        restaurants: [...state.restaurants, res.data],
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to create restaurant',
        isMutating: false,
      });
      throw err;
    }
  },

  updateRestaurant: async (id, data) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.patch<RestaurantType>(`/restaurants/${id}`, data);
      set((state) => ({
        myRestaurant: res.data,
        currentRestaurant:
          state.currentRestaurant?.id === id ? res.data : state.currentRestaurant,
        restaurants: state.restaurants.map((r) => (r.id === id ? res.data : r)),
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to update restaurant',
        isMutating: false,
      });
      throw err;
    }
  },

  toggleOnline: async (id, isOnline) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.patch<RestaurantType>(`/restaurants/${id}`, { isOnline });
      set((state) => ({
        myRestaurant: res.data,
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to update status',
        isMutating: false,
      });
      throw err;
    }
  },

  toggleOpen: async (id, isOpen) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.patch<RestaurantType>(`/restaurants/${id}`, { isOpen });
      set((state) => ({
        myRestaurant: res.data,
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to update status',
        isMutating: false,
      });
      throw err;
    }
  },
}));
