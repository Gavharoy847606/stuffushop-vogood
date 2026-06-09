"use client";

import { useEffect } from "react";
import { useProductStore, Product } from "@/lib/stores/product-store";
import {
  Plus,
  Minus,
  Search,
  Filter,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  onUpdateStock: (productId: string, delta: number) => void;
}

function ProductCard({ product, onUpdateStock }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStock;

  return (
    <div className="glass-card-hover overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src =
              "https://images.unsplash.com/photo-1583496661160-fb5886a0edd1?w=400&h=400&fit=crop";
          }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* SKU Badge */}
        <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground border-glass-border">
          {product.sku}
        </Badge>
        {/* Status Badge */}
        {isOutOfStock && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground border-0">
            Out of Stock
          </Badge>
        )}
        {isLowStock && (
          <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground border-0 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          <span
            className={`text-sm font-medium ${isOutOfStock ? "text-destructive" : isLowStock ? "text-warning" : "text-muted-foreground"}`}
          >
            {product.stock} in stock
          </span>
        </div>

        {/* Stock Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-glass-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            onClick={() => onUpdateStock(product.id, -1)}
            disabled={product.stock === 0}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-lg font-bold text-foreground min-w-[3rem] text-center">
            {product.stock}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-glass-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            onClick={() => onUpdateStock(product.id, 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function InventoryPage() {
  const {
    products,
    isLoading,
    filter,
    searchQuery,
    fetchProducts,
    updateStock,
    setFilter,
    setSearchQuery,
    getFilteredProducts,
    getOutOfStockCount,
    getLowStockProducts,
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = getFilteredProducts();
  const outOfStockCount = getOutOfStockCount();
  const lowStockCount = getLowStockProducts().length;
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Inventory (WMS)
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your product stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <Package className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {outOfStockCount} Out of Stock
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">
              {lowStockCount} Low Stock
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input/50 border-glass-border"
            />
          </div>
          <div className="flex gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] bg-input/50 border-glass-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-glass-border">
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-4 animate-pulse">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="flex justify-between">
                <div className="h-5 bg-muted rounded w-1/4" />
                <div className="h-5 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            
            <ProductCard
              key={product.id}
              product={product}
              onUpdateStock={updateStock}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} products
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Total Value:{" "}
            <span className="font-semibold text-foreground">
              $
              {products
                .reduce((sum, p) => sum + p.price * p.stock, 0)
                .toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
