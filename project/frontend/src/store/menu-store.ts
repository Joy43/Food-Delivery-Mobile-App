import { create } from 'zustand';
import { api } from '@/lib/api-client';
import { MenuCategory, MenuItem } from '@food-delivery/types';

interface MenuState {
  categories: MenuCategory[];
  items: MenuItem[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchMenu: (restaurantId: string) => Promise<{ categories: MenuCategory[]; items: MenuItem[] }>;
  createCategory: (name: string, restaurantId: string) => Promise<MenuCategory>;
  deleteCategory: (id: string) => Promise<void>;
  createMenuItem: (payload: Partial<MenuItem> & { categoryId: string }) => Promise<MenuItem>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleAvailability: (itemId: string, isAvailable: boolean) => Promise<MenuItem>;
}

export const useMenuStore = create<MenuState>((set) => ({
  categories: [],
  items: [],
  isLoading: false,
  isMutating: false,
  error: null,

  fetchMenu: async (restaurantId) => {
    set({ isLoading: true, error: null });
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        api.get<MenuCategory[]>(`/menu/categories/${restaurantId}`),
        api.get<MenuItem[]>(`/menu/items/${restaurantId}`),
      ]);
      const categories = categoriesRes.data || [];
      const items = itemsRes.data || [];
      set({
        categories,
        items,
        isLoading: false,
      });
      return { categories, items };
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load menu', isLoading: false });
      throw err;
    }
  },

  createCategory: async (name, restaurantId) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post<MenuCategory>('/menu/categories', { name, restaurantId });
      set((state) => ({
        categories: [...state.categories, res.data],
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to create category', isMutating: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isMutating: true, error: null });
    try {
      await api.delete(`/menu/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        items: state.items.filter((i) => i.categoryId !== id),
        isMutating: false,
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete category', isMutating: false });
      throw err;
    }
  },

  createMenuItem: async (payload) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post<MenuItem>('/menu/items', payload);
      set((state) => ({
        items: [...state.items, res.data],
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to create item', isMutating: false });
      throw err;
    }
  },

  deleteMenuItem: async (id) => {
    set({ isMutating: true, error: null });
    try {
      await api.delete(`/menu/items/${id}`);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isMutating: false,
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete item', isMutating: false });
      throw err;
    }
  },

  toggleAvailability: async (itemId, isAvailable) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.patch<MenuItem>(`/menu/items/${itemId}/availability`, {
        isAvailable,
      });
      set((state) => ({
        items: state.items.map((item) => (item.id === itemId ? res.data : item)),
        isMutating: false,
      }));
      return res.data;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update item availability', isMutating: false });
      throw err;
    }
  },
}));
