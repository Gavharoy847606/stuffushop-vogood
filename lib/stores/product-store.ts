import { create } from "zustand";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  minStock: number;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  filter: string;
  searchQuery: string;
  fetchProducts: () => Promise<void>;
  updateStock: (productId: string, delta: number) => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  getFilteredProducts: () => Product[];
  getOutOfStockCount: () => number;
  getLowStockProducts: () => Product[];
}

import MOCK_PRODUCTS from "@/lib/mock/products";

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  filter: "all",
  searchQuery: "",

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/products");
      const data = await response.json();

      if (response.ok && Array.isArray(data.products)) {
        set({ products: data.products, isLoading: false });
      } else {
        console.error(
          "Failed to fetch products",
          data?.error ?? "Unknown error",
        );
        set({ products: MOCK_PRODUCTS, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      set({ products: MOCK_PRODUCTS, isLoading: false });
    }
  },

  updateStock: async (productId: string, delta: number) => {
    // Optimistically update stock in UI state
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId
          ? { ...product, stock: Math.max(0, product.stock + delta) }
          : product,
      ),
    }));

    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId, delta }),
      });

      if (!response.ok) {
        console.error("Failed to update stock in database");
        // Rollback state by re-fetching all products
        const getProductsResponse = await fetch("/api/products");
        const getProductsData = await getProductsResponse.json();
        if (getProductsResponse.ok) {
          set({ products: getProductsData.products });
        }
      }
    } catch (error) {
      console.error("Failed to update stock in database:", error);
    }
  },

  setFilter: (filter: string) => {
    set({ filter });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredProducts: () => {
    const { products, filter, searchQuery } = get();
    let filtered = products;

    if (filter !== "all") {
      if (filter === "out-of-stock") {
        filtered = filtered.filter((p) => p.stock === 0);
      } else if (filter === "low-stock") {
        filtered = filtered.filter((p) => p.stock > 0 && p.stock <= p.minStock);
      } else {
        filtered = filtered.filter((p) => p.category === filter);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }

    return filtered;
  },

  getOutOfStockCount: () => {
    return get().products.filter((p) => p.stock === 0).length;
  },

  getLowStockProducts: () => {
    return get().products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  },
}));
