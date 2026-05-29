import { create } from 'zustand'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  orderNumber: string
  clientId: string
  clientName: string
  clientEmail: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  shippingAddress: string
}

interface OrderState {
  orders: Order[]
  isLoading: boolean
  statusFilter: OrderStatus | 'all'
  searchQuery: string
  fetchOrders: () => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  setStatusFilter: (status: OrderStatus | 'all') => void
  setSearchQuery: (query: string) => void
  getFilteredOrders: () => Order[]
  getTotalRevenue: () => number
  getPendingOrdersCount: () => number
}

// Mock order data with SQL JOIN simulation (client names fetched from clients table)
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    clientId: 'CLT-001',
    clientName: 'Fashion Forward LLC',
    clientEmail: 'orders@fashionforward.com',
    items: [
      { productId: '1', productName: 'Premium Leather Jacket', quantity: 10, price: 299.99 },
      { productId: '3', productName: 'Slim Fit Denim', quantity: 25, price: 89.99 }
    ],
    totalAmount: 5249.65,
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
    shippingAddress: '123 Fashion Ave, New York, NY 10001'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    clientId: 'CLT-002',
    clientName: 'Urban Style Co.',
    clientEmail: 'purchasing@urbanstyle.com',
    items: [
      { productId: '5', productName: 'Urban Sneakers', quantity: 50, price: 129.99 },
      { productId: '6', productName: 'Wool Blend Hoodie', quantity: 30, price: 79.99 }
    ],
    totalAmount: 8899.20,
    status: 'pending',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    shippingAddress: '456 Urban Blvd, Los Angeles, CA 90001'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    clientId: 'CLT-003',
    clientName: 'Elite Boutique',
    clientEmail: 'orders@eliteboutique.com',
    items: [
      { productId: '4', productName: 'Elegant Evening Dress', quantity: 15, price: 199.99 },
      { productId: '9', productName: 'Cashmere Sweater', quantity: 20, price: 249.99 }
    ],
    totalAmount: 7999.65,
    status: 'processing',
    createdAt: '2024-01-22T11:45:00Z',
    updatedAt: '2024-01-23T08:30:00Z',
    shippingAddress: '789 Elite Plaza, Miami, FL 33101'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    clientId: 'CLT-004',
    clientName: 'Trendy Threads Inc.',
    clientEmail: 'supply@trendythreads.com',
    items: [
      { productId: '2', productName: 'Cotton Basic Tee', quantity: 100, price: 29.99 },
      { productId: '10', productName: 'Chino Pants', quantity: 50, price: 59.99 }
    ],
    totalAmount: 5998.50,
    status: 'shipped',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-01-27T10:15:00Z',
    shippingAddress: '321 Trend Street, Chicago, IL 60601'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    clientId: 'CLT-005',
    clientName: 'Classic Wear Ltd.',
    clientEmail: 'orders@classicwear.com',
    items: [
      { productId: '7', productName: 'Classic Blazer', quantity: 20, price: 179.99 },
      { productId: '11', productName: 'Polo Shirt', quantity: 40, price: 49.99 }
    ],
    totalAmount: 5599.40,
    status: 'pending',
    createdAt: '2024-01-28T16:30:00Z',
    updatedAt: '2024-01-28T16:30:00Z',
    shippingAddress: '654 Classic Lane, Boston, MA 02101'
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    clientId: 'CLT-006',
    clientName: 'Seasonal Styles',
    clientEmail: 'buying@seasonalstyles.com',
    items: [
      { productId: '12', productName: 'Trench Coat', quantity: 15, price: 189.99 },
      { productId: '8', productName: 'Pleated Midi Skirt', quantity: 25, price: 69.99 }
    ],
    totalAmount: 4599.60,
    status: 'completed',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    shippingAddress: '987 Season Ave, Seattle, WA 98101'
  },
  {
    id: '7',
    orderNumber: 'ORD-2024-007',
    clientId: 'CLT-007',
    clientName: 'Metro Fashion Group',
    clientEmail: 'procurement@metrofashion.com',
    items: [
      { productId: '1', productName: 'Premium Leather Jacket', quantity: 5, price: 299.99 },
      { productId: '4', productName: 'Elegant Evening Dress', quantity: 10, price: 199.99 },
      { productId: '9', productName: 'Cashmere Sweater', quantity: 15, price: 249.99 }
    ],
    totalAmount: 7249.70,
    status: 'pending',
    createdAt: '2024-01-29T13:45:00Z',
    updatedAt: '2024-01-29T13:45:00Z',
    shippingAddress: '111 Metro Center, Denver, CO 80201'
  },
  {
    id: '8',
    orderNumber: 'ORD-2024-008',
    clientId: 'CLT-008',
    clientName: 'Coastal Apparel',
    clientEmail: 'orders@coastalapparel.com',
    items: [
      { productId: '6', productName: 'Wool Blend Hoodie', quantity: 60, price: 79.99 },
      { productId: '2', productName: 'Cotton Basic Tee', quantity: 80, price: 29.99 }
    ],
    totalAmount: 7198.60,
    status: 'completed',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z',
    shippingAddress: '222 Coastal Drive, San Diego, CA 92101'
  }
]

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  statusFilter: 'all',
  searchQuery: '',

  fetchOrders: async () => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      if (response.ok) {
        set({ orders: data.orders, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Failed to fetch orders', error)
      set({ isLoading: false })
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    // Optimistically update locally
    set(state => ({
      orders: state.orders.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    }))

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: orderId, status })
      })

      if (!response.ok) {
        console.error('Failed to update order status in database')
        // Rollback state by fetching orders again
        const getOrdersResponse = await fetch('/api/orders')
        const getOrdersData = await getOrdersResponse.json()
        if (getOrdersResponse.ok) {
          set({ orders: getOrdersData.orders })
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  },

  setStatusFilter: (status: OrderStatus | 'all') => {
    set({ statusFilter: status })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
  },

  getFilteredOrders: () => {
    const { orders, statusFilter, searchQuery } = get()
    let filtered = orders

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        o =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.clientName.toLowerCase().includes(query) ||
          o.clientEmail.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  getTotalRevenue: () => {
    return get().orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  },

  getPendingOrdersCount: () => {
    return get().orders.filter(o => o.status === 'pending').length
  }
}))
