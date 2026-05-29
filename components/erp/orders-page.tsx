'use client'

import { useEffect } from 'react'
import { useOrderStore, Order, OrderStatus } from '@/lib/stores/order-store'
import { Search, Filter, Package, Calendar, Mail, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-primary/20 text-primary border-primary/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
}

interface OrderCardProps {
  order: Order
}

function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="glass-card-hover p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">{order.clientName}</p>
        </div>
        <Badge className={`${STATUS_COLORS[order.status]} border`}>
          {order.status}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span>{order.clientEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{order.shippingAddress}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-glass-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {order.items.length} item{order.items.length > 1 ? 's' : ''}
          </span>
          <span className="text-lg font-bold text-primary">
            ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}

function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-glass-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Order</TableHead>
            <TableHead className="text-muted-foreground">Client</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-glass-border hover:bg-secondary/30">
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{order.clientName}</p>
                  <p className="text-xs text-muted-foreground">{order.clientEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${STATUS_COLORS[order.status]} border`}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right font-semibold text-foreground">
                ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function OrdersPage() {
  const {
    orders,
    isLoading,
    statusFilter,
    searchQuery,
    fetchOrders,
    setStatusFilter,
    setSearchQuery,
    getFilteredOrders,
    getTotalRevenue,
    getPendingOrdersCount
  } = useOrderStore()

  const isMobile = useIsMobile()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = getFilteredOrders()
  const totalRevenue = getTotalRevenue()
  const pendingCount = getPendingOrdersCount()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg glass-card">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold text-primary">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="px-4 py-2 rounded-lg glass-card">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-warning">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input/50 border-glass-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
            <SelectTrigger className="w-[180px] bg-input/50 border-glass-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-glass-border">
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="glass-card p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <OrdersTable orders={filteredOrders} />
      )}

      {/* Summary */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Filtered Total: <span className="font-semibold text-foreground">
              ${filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
