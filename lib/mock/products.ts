import type { Product } from "@/lib/stores/product-store";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    sku: "JKT-001",
    name: "Premium Leather Jacket",
    description: "High-quality genuine leather jacket",
    price: 299.99,
    stock: 15,
    category: "Outerwear",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    minStock: 5,
  },
  {
    id: "2",
    sku: "TSH-002",
    name: "Cotton Basic Tee",
    description: "100% organic cotton t-shirt",
    price: 29.99,
    stock: 0,
    category: "Tops",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    minStock: 20,
  },
  {
    id: "3",
    sku: "JNS-003",
    name: "Slim Fit Denim",
    description: "Classic slim fit jeans",
    price: 89.99,
    stock: 42,
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    minStock: 15,
  },
  {
    id: "4",
    sku: "DRS-004",
    name: "Elegant Evening Dress",
    description: "Sophisticated evening wear",
    price: 199.99,
    stock: 8,
    category: "Dresses",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
    minStock: 5,
  },
  {
    id: "5",
    sku: "SNK-005",
    name: "Urban Sneakers",
    description: "Comfortable street-style sneakers",
    price: 129.99,
    stock: 0,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    minStock: 10,
  },
  {
    id: "6",
    sku: "HDE-006",
    name: "Wool Blend Hoodie",
    description: "Premium wool-blend hoodie",
    price: 79.99,
    stock: 25,
    category: "Tops",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    minStock: 10,
  },
  {
    id: "7",
    sku: "BLZ-007",
    name: "Classic Blazer",
    description: "Tailored fit blazer",
    price: 179.99,
    stock: 12,
    category: "Outerwear",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop",
    minStock: 8,
  },
  {
    id: "8",
    sku: "SKT-008",
    name: "Pleated Midi Skirt",
    description: "Elegant pleated skirt",
    price: 69.99,
    stock: 3,
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5886a0edd1?w=400&h=400&fit=crop",
    minStock: 8,
  },
  {
    id: "9",
    sku: "SWR-009",
    name: "Cashmere Sweater",
    description: "Luxury cashmere pullover",
    price: 249.99,
    stock: 18,
    category: "Tops",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
    minStock: 5,
  },
  {
    id: "10",
    sku: "CHN-010",
    name: "Chino Pants",
    description: "Classic fit chino pants",
    price: 59.99,
    stock: 35,
    category: "Bottoms",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop",
    minStock: 15,
  },
  {
    id: "11",
    sku: "PLO-011",
    name: "Polo Shirt",
    description: "Classic polo shirt",
    price: 49.99,
    stock: 0,
    category: "Tops",
    image:
      "https://images.unsplash.com/photo-1625910513413-5fc45b28e9d5?w=400&h=400&fit=crop",
    minStock: 20,
  },
  {
    id: "12",
    sku: "CTN-012",
    name: "Trench Coat",
    description: "Waterproof trench coat",
    price: 189.99,
    stock: 7,
    category: "Outerwear",
    image:
      "https://images.unsplash.com/photo-1544923246-77307dd628b7?w=400&h=400&fit=crop",
    minStock: 5,
  },
];

export default MOCK_PRODUCTS;
