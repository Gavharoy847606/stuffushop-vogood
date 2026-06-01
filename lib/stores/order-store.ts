import { create } from "zustand";
import { MOCK_ORDERS } from "@/lib/mock/orders";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  statusFilter: OrderStatus | "all";
  searchQuery: string;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setStatusFilter: (status: OrderStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  getFilteredOrders: () => Order[];
  getTotalRevenue: () => number;
  getPendingOrdersCount: () => number;
}

// Use shared generated mock orders for richer historical data

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  statusFilter: "all",
  searchQuery: "",

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (response.ok && Array.isArray(data.orders)) {
        set({ orders: data.orders, isLoading: false });
      } else {
        console.warn(
          "Orders API returned no data, falling back to mock orders",
        );
        set({ orders: MOCK_ORDERS, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      set({ orders: MOCK_ORDERS, isLoading: false });
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    // Optimistically update locally
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order,
      ),
    }));

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: orderId, status }),
      });

      if (!response.ok) {
        console.error("Failed to update order status in database");
        // Rollback state by fetching orders again
        const getOrdersResponse = await fetch("/api/orders");
        const getOrdersData = await getOrdersResponse.json();
        if (getOrdersResponse.ok) {
          set({ orders: getOrdersData.orders });
        }
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  },

  setStatusFilter: (status: OrderStatus | "all") => {
    set({ statusFilter: status });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredOrders: () => {
    const { orders, statusFilter, searchQuery } = get();
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.clientName.toLowerCase().includes(query) ||
          o.clientEmail.toLowerCase().includes(query),
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  getTotalRevenue: () => {
    return get()
      .orders.filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0);
  },

  getPendingOrdersCount: () => {
    return get().orders.filter((o) => o.status === "pending").length;
  },
}));
