"use client";

import { useEffect } from "react";
import { useProductStore } from "@/lib/stores/product-store";
import { useOrderStore } from "@/lib/stores/order-store";
import {
  ShoppingCart,
  DollarSign,
  PackageX,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Users,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
}: KPICardProps) {
  return (
    <div className="glass-card-hover p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-primary" />
              ) : trend === "down" ? (
                <ArrowDownRight className="w-4 h-4 text-destructive" />
              ) : null}
              <span
                className={
                  trend === "up"
                    ? "text-primary"
                    : trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10 text-primary">{icon}</div>
      </div>
    </div>
  );
}

function RecentOrdersWidget() {
  const { orders } = useOrderStore();
  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/20 text-warning border-warning/30";
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "shipped":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "completed":
        return "bg-primary/20 text-primary border-primary/30";
      case "cancelled":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <span className="text-sm text-muted-foreground">Last 5 orders</span>
      </div>
      <div className="space-y-3">
        {recentOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.clientName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                ${order.totalAmount.toLocaleString()}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LowStockWidget() {
  const { getLowStockProducts } = useProductStore();
  const lowStock = getLowStockProducts().slice(0, 4);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Low Stock Alert
        </h3>
        <PackageX className="w-5 h-5 text-warning" />
      </div>
      <div className="space-y-3">
        {lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All products are well stocked!
          </p>
        ) : (
          lowStock.map((product) => (
            <div
              key={product.id}
              className="flex-col items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
            >
              <div className="flex-col items-center gap-3">
                <img
                  src="https://kaleidoscope.scene7.com/is/image/OttoUK/600w/Witt-Denim-Pleat-Midi-Skirt~B51972FRSP.jpg"
                  alt={product.name}
                  loading="lazy"
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    t.onerror = null;
                    t.src =
                      "https://www.vettedmag.com/wp-content/uploads/2025/05/claire-rose-in-a-midi-pleated-skirt.jpg.webp";
                  }}
                  className="w-400 h-100 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-warning">
                  {product.stock} left
                </p>
                <p className="text-xs text-muted-foreground">
                  Min: {product.minStock}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { products, fetchProducts, getOutOfStockCount } = useProductStore();
  const { orders, fetchOrders, getTotalRevenue, getPendingOrdersCount } =
    useOrderStore();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const totalRevenue = getTotalRevenue();
  const outOfStockCount = getOutOfStockCount();
  const pendingOrders = getPendingOrdersCount();
  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s your business overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Orders"
          value={totalOrders}
          change={12}
          changeLabel="vs last month"
          icon={<ShoppingCart className="w-6 h-6" />}
          trend="up"
        />
        <KPICard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={8.5}
          changeLabel="vs last month"
          icon={<DollarSign className="w-6 h-6" />}
          trend="up"
        />
        <KPICard
          title="Out of Stock"
          value={outOfStockCount}
          change={outOfStockCount > 0 ? -15 : 0}
          changeLabel="items"
          icon={<PackageX className="w-6 h-6" />}
          trend={outOfStockCount > 0 ? "down" : "neutral"}
        />
        <KPICard
          title="Pending Orders"
          value={pendingOrders}
          change={5}
          changeLabel="new today"
          icon={<TrendingUp className="w-6 h-6" />}
          trend="up"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">{products.length}</p>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {new Set(orders.map((o) => o.clientId)).size}
          </p>
          <p className="text-sm text-muted-foreground">Active Clients</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {orders.filter((o) => o.status === "completed").length}
          </p>
          <p className="text-sm text-muted-foreground">Completed Orders</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {Math.round(
              orders.reduce(
                (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
                0,
              ),
            )}
          </p>
          <p className="text-sm text-muted-foreground">Items Sold</p>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersWidget />
        <LowStockWidget />
      </div>
    </div>
  );
}
