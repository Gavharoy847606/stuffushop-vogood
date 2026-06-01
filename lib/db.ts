import { Pool } from "pg";

const pool = new Pool({
  host:
    process.env.DB_HOST ||
    "dpg-d808kc8sfn5c739appug-a.virginia-postgres.render.com",
  database: process.env.DB_NAME || "localhost_mvo8",
  user: process.env.DB_USER || "wed",
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

let dbInitialized = false;
let useMockDb = false;
const mockedTables = new Set<string>();

const mockUsers = [
  {
    id: "1",
    email: "anvar.admin@erp.com",
    password: "password123",
    name: "Anvar Admin",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658ab4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "2",
    email: "manager@erp.com",
    password: "password123",
    name: "Maria Manager",
    role: "manager",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "3",
    email: "employee@erp.com",
    password: "password123",
    name: "John Employee",
    role: "employee",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
];

export function findMockUserByEmail(email: string) {
  if (!email) return undefined;
  return mockUsers.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase(),
  );
}

const mockProducts = [
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

const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    clientId: "CLT-001",
    clientName: "Fashion Forward LLC",
    clientEmail: "orders@fashionforward.com",
    totalAmount: 5249.65,
    status: "completed",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
    shippingAddress: "123 Fashion Ave, New York, NY 10001",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    clientId: "CLT-002",
    clientName: "Urban Style Co.",
    clientEmail: "purchasing@urbanstyle.com",
    totalAmount: 8899.2,
    status: "pending",
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
    shippingAddress: "456 Urban Blvd, Los Angeles, CA 90001",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    clientId: "CLT-003",
    clientName: "Elite Boutique",
    clientEmail: "orders@eliteboutique.com",
    totalAmount: 7999.65,
    status: "processing",
    createdAt: "2024-01-22T11:45:00Z",
    updatedAt: "2024-01-23T08:30:00Z",
    shippingAddress: "789 Elite Plaza, Miami, FL 33101",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    clientId: "CLT-004",
    clientName: "Trendy Threads Inc.",
    clientEmail: "supply@trendythreads.com",
    totalAmount: 5998.5,
    status: "shipped",
    createdAt: "2024-01-25T14:00:00Z",
    updatedAt: "2024-01-27T10:15:00Z",
    shippingAddress: "321 Trend Street, Chicago, IL 60601",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    clientId: "CLT-005",
    clientName: "Classic Wear Ltd.",
    clientEmail: "orders@classicwear.com",
    totalAmount: 5599.4,
    status: "pending",
    createdAt: "2024-01-28T16:30:00Z",
    updatedAt: "2024-01-28T16:30:00Z",
    shippingAddress: "654 Classic Lane, Boston, MA 02101",
  },
  {
    id: "6",
    orderNumber: "ORD-2024-006",
    clientId: "CLT-006",
    clientName: "Seasonal Styles",
    clientEmail: "buying@seasonalstyles.com",
    totalAmount: 4599.6,
    status: "completed",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
    shippingAddress: "987 Season Ave, Seattle, WA 98101",
  },
  {
    id: "7",
    orderNumber: "ORD-2024-007",
    clientId: "CLT-007",
    clientName: "Metro Fashion Group",
    clientEmail: "procurement@metrofashion.com",
    totalAmount: 7249.7,
    status: "pending",
    createdAt: "2024-01-29T13:45:00Z",
    updatedAt: "2024-01-29T13:45:00Z",
    shippingAddress: "111 Metro Center, Denver, CO 80201",
  },
  {
    id: "8",
    orderNumber: "ORD-2024-008",
    clientId: "CLT-008",
    clientName: "Coastal Apparel",
    clientEmail: "orders@coastalapparel.com",
    totalAmount: 7198.6,
    status: "completed",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-10T16:00:00Z",
    shippingAddress: "222 Coastal Drive, San Diego, CA 92101",
  },
];

const mockOrderItems = [
  {
    orderId: "1",
    productId: "1",
    productName: "Premium Leather Jacket",
    quantity: 10,
    price: 299.99,
  },
  {
    orderId: "1",
    productId: "3",
    productName: "Slim Fit Denim",
    quantity: 25,
    price: 89.99,
  },
  {
    orderId: "2",
    productId: "5",
    productName: "Urban Sneakers",
    quantity: 50,
    price: 129.99,
  },
  {
    orderId: "2",
    productId: "6",
    productName: "Wool Blend Hoodie",
    quantity: 30,
    price: 79.99,
  },
  {
    orderId: "3",
    productId: "4",
    productName: "Elegant Evening Dress",
    quantity: 15,
    price: 199.99,
  },
  {
    orderId: "3",
    productId: "9",
    productName: "Cashmere Sweater",
    quantity: 20,
    price: 249.99,
  },
  {
    orderId: "4",
    productId: "2",
    productName: "Cotton Basic Tee",
    quantity: 100,
    price: 29.99,
  },
  {
    orderId: "4",
    productId: "10",
    productName: "Chino Pants",
    quantity: 50,
    price: 59.99,
  },
  {
    orderId: "5",
    productId: "7",
    productName: "Classic Blazer",
    quantity: 20,
    price: 179.99,
  },
  {
    orderId: "5",
    productId: "11",
    productName: "Polo Shirt",
    quantity: 40,
    price: 49.99,
  },
  {
    orderId: "6",
    productId: "12",
    productName: "Trench Coat",
    quantity: 15,
    price: 189.99,
  },
  {
    orderId: "6",
    productId: "8",
    productName: "Pleated Midi Skirt",
    quantity: 25,
    price: 69.99,
  },
  {
    orderId: "7",
    productId: "1",
    productName: "Premium Leather Jacket",
    quantity: 5,
    price: 299.99,
  },
  {
    orderId: "7",
    productId: "4",
    productName: "Elegant Evening Dress",
    quantity: 10,
    price: 199.99,
  },
  {
    orderId: "7",
    productId: "9",
    productName: "Cashmere Sweater",
    quantity: 15,
    price: 249.99,
  },
  {
    orderId: "8",
    productId: "6",
    productName: "Wool Blend Hoodie",
    quantity: 60,
    price: 79.99,
  },
  {
    orderId: "8",
    productId: "2",
    productName: "Cotton Basic Tee",
    quantity: 80,
    price: 29.99,
  },
];

function isDbAuthError(error: any) {
  return (
    error?.code === "28P01" ||
    /password authentication failed/i.test(error?.message || "")
  );
}

function isMissingTableError(error: any) {
  return (
    error?.code === "42P01" ||
    /does not exist/i.test(error?.message || "") ||
    /relation ".+" does not exist/i.test(error?.message || "")
  );
}

function parseTablesFromQuery(text: string) {
  const tables: string[] = [];
  const lower = text.toLowerCase();
  const candidates = [
    "clents",
    "clients",
    "orders",
    "products",
    "order_items",
    "order_items",
    "orderitems",
  ];
  for (const t of candidates) {
    if (
      lower.includes(` ${t}`) ||
      lower.includes(`${t} `) ||
      lower.includes(`.${t}`) ||
      lower.includes(`'${t}'`)
    ) {
      tables.push(t === "clients" ? "clents" : t);
    }
  }
  return Array.from(new Set(tables));
}

function enableMockDb(error: any) {
  useMockDb = true;
  dbInitialized = true;
  console.warn(
    "Database connection failed, using mock data instead:",
    error?.message || error,
  );
}

function mockQuery(text: string, params?: any[]) {
  const normalized = text.trim().replace(/\s+/g, " ").toLowerCase();

  if (normalized.startsWith("select * from clents")) {
    const email = params?.[0]?.toString().toLowerCase();
    const user = mockUsers.find((item) => item.email.toLowerCase() === email);
    return { rows: user ? [user] : [] };
  }

  if (normalized.includes("select count(*) from clents")) {
    return { rows: [{ count: mockUsers.length.toString() }] };
  }

  if (normalized.includes("select count(*) from products")) {
    return { rows: [{ count: mockProducts.length.toString() }] };
  }

  if (normalized.includes("select count(*) from orders")) {
    return { rows: [{ count: mockOrders.length.toString() }] };
  }

  if (
    normalized.includes("from products") &&
    !normalized.includes("update products")
  ) {
    return {
      rows: [...mockProducts].sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  if (normalized.includes("update products set stock")) {
    const delta = Number(params?.[0] ?? 0);
    const id = params?.[1]?.toString();
    const product = mockProducts.find((item) => item.id === id);
    if (!product) {
      return { rows: [] };
    }
    product.stock = Math.max(0, product.stock + delta);
    return { rows: [{ ...product, minStock: product.minStock }] };
  }

  if (
    normalized.includes("from orders") &&
    normalized.includes("order by created_at desc")
  ) {
    return { rows: [...mockOrders] };
  }

  if (
    normalized.includes("from order_items") &&
    normalized.includes("where order_id = $1")
  ) {
    const orderId = params?.[0]?.toString();
    return {
      rows: mockOrderItems
        .filter((item) => item.orderId === orderId)
        .map((item) => ({ ...item })),
    };
  }

  if (normalized.includes("from order_items")) {
    return { rows: [...mockOrderItems] };
  }

  if (normalized.includes("update orders")) {
    const status = params?.[0]?.toString();
    const id = params?.[1]?.toString();
    const order = mockOrders.find((item) => item.id === id);
    if (!order) {
      return { rows: [] };
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return { rows: [{ ...order }] };
  }

  throw new Error(`Mock DB does not support query: ${text}`);
}

export async function query(text: string, params?: any[]) {
  if (useMockDb) {
    return mockQuery(text, params);
  }

  if (!dbInitialized) {
    try {
      await initDb();
    } catch (error: any) {
      if (useMockDb) {
        return mockQuery(text, params);
      }
      throw error;
    }
  }

  try {
    return await pool.query(text, params);
  } catch (error: any) {
    // If authentication failed, fall back to full mock in development
    if (isDbAuthError(error) && process.env.NODE_ENV !== "production") {
      enableMockDb(error);
      return mockQuery(text, params);
    }

    // If a specific table is missing, mark that table for mocking (development only)
    if (isMissingTableError(error) && process.env.NODE_ENV !== "production") {
      const tables = parseTablesFromQuery(text);
      if (tables.length > 0) {
        tables.forEach((t) => mockedTables.add(t));
        console.warn(
          "Missing table(s) detected, using mock for:",
          tables.join(", "),
        );
        return mockQuery(text, params);
      }
    }

    throw error;
  }
}

export async function initDb() {
  if (dbInitialized) return;

  try {
    // Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clents (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        avatar TEXT
      )
    `);

    // Create Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        sku VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        image TEXT,
        min_stock INT NOT NULL
      )
    `);

    // Create Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        client_id VARCHAR(50) NOT NULL,
        client_name VARCHAR(100) NOT NULL,
        client_email VARCHAR(100) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        shipping_address TEXT
      )
    `);

    // Create Order Items table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id VARCHAR(50) PRIMARY KEY,
          order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
          product_id VARCHAR(50) NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          price NUMERIC(10, 2) NOT NULL
        )
      `);
    } catch (err: any) {
      // If FK cannot be implemented due to existing incompatible schema (e.g. orders.id integer),
      // fall back to mocking orders/order_items in development instead of failing startup.
      if (err?.code === "42804" && process.env.NODE_ENV !== "production") {
        mockedTables.add("orders");
        mockedTables.add("order_items");
        console.warn(
          "Foreign key constraint cannot be implemented - using mock for orders and order_items:",
          err.message || err,
        );
      } else {
        throw err;
      }
    }

    // Seed Users if empty
    const usersCount = await pool.query("SELECT COUNT(*) FROM clents");
    if (parseInt(usersCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO clents (id, email, password, name, role, avatar) VALUES
        ('1', 'anvar.admin@erp.com', 'password123', 'Anvar Admin', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
        ('2', 'manager@erp.com', 'password123', 'Maria Manager', 'manager', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'),
        ('3', 'employee@erp.com', 'password123', 'John Employee', 'employee', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face')
      `);
    }

    // Seed Products if empty
    const productsCount = await pool.query("SELECT COUNT(*) FROM products");
    if (parseInt(productsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (id, sku, name, description, price, stock, category, image, min_stock) VALUES
        ('1', 'JKT-001', 'Premium Leather Jacket', 'High-quality genuine leather jacket', 299.99, 15, 'Outerwear', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', 5),
        ('2', 'TSH-002', 'Cotton Basic Tee', '100% organic cotton t-shirt', 29.99, 0, 'Tops', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', 20),
        ('3', 'JNS-003', 'Slim Fit Denim', 'Classic slim fit jeans', 89.99, 42, 'Bottoms', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', 15),
        ('4', 'DRS-004', 'Elegant Evening Dress', 'Sophisticated evening wear', 199.99, 8, 'Dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', 5),
        ('5', 'SNK-005', 'Urban Sneakers', 'Comfortable street-style sneakers', 129.99, 0, 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 10),
        ('6', 'HDE-006', 'Wool Blend Hoodie', 'Premium wool-blend hoodie', 79.99, 25, 'Tops', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', 10),
        ('7', 'BLZ-007', 'Classic Blazer', 'Tailored fit blazer', 179.99, 12, 'Outerwear', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop', 8),
        ('8', 'SKT-008', 'Pleated Midi Skirt', 'Elegant pleated skirt', 69.99, 3, 'Bottoms', 'https://images.unsplash.com/photo-1583496661160-fb5886a0edd1?w=400&h=400&fit=crop', 8),
        ('9', 'SWR-009', 'Cashmere Sweater', 'Luxury cashmere pullover', 249.99, 18, 'Tops', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop', 5),
        ('10', 'CHN-010', 'Chino Pants', 'Classic fit chino pants', 59.99, 35, 'Bottoms', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop', 15),
        ('11', 'PLO-011', 'Polo Shirt', 'Classic polo shirt', 49.99, 0, 'Tops', 'https://images.unsplash.com/photo-1625910513413-5fc45b28e9d5?w=400&h=400&fit=crop', 20),
        ('12', 'CTN-012', 'Trench Coat', 'Waterproof trench coat', 189.99, 7, 'Outerwear', 'https://images.unsplash.com/photo-1544923246-77307dd628b7?w=400&h=400&fit=crop', 5)
      `);
    }

    // Seed Orders and Order Items if empty
    const ordersCount = await pool.query("SELECT COUNT(*) FROM orders");
    if (parseInt(ordersCount.rows[0].count) === 0) {
      // Order 1
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('1', 'ORD-2024-001', 'CLT-001', 'Fashion Forward LLC', 'orders@fashionforward.com', 5249.65, 'completed', '2024-01-15T10:30:00Z', '2024-01-18T14:20:00Z', '123 Fashion Ave, New York, NY 10001')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ('1', '1', 'Premium Leather Jacket', 10, 299.99),
        ('1', '3', 'Slim Fit Denim', 25, 89.99)
      `);

      // Order 2
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('2', 'ORD-2024-002', 'CLT-002', 'Urban Style Co.', 'purchasing@urbanstyle.com', 8899.20, 'pending', '2024-01-20T09:15:00Z', '2024-01-20T09:15:00Z', '456 Urban Blvd, Los Angeles, CA 90001')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ('2', '5', 'Urban Sneakers', 50, 129.99),
        ('2', '6', 'Wool Blend Hoodie', 30, 79.99)
      `);

      // Order 3
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('3', 'ORD-2024-003', 'CLT-003', 'Elite Boutique', 'orders@eliteboutique.com', 7999.65, 'processing', '2024-01-22T11:45:00Z', '2024-01-23T08:30:00Z', '789 Elite Plaza, Miami, FL 33101')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ('3', '4', 'Elegant Evening Dress', 15, 199.99),
        ('3', '9', 'Cashmere Sweater', 20, 249.99)
      `);

      // Order 4
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('4', 'ORD-2024-004', 'CLT-004', 'Trendy Threads Inc.', 'supply@trendythreads.com', 5998.50, 'shipped', '2024-01-25T14:00:00Z', '2024-01-27T10:15:00Z', '321 Trend Street, Chicago, IL 60601')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ('4', '2', 'Cotton Basic Tee', 100, 29.99),
        ('4', '10', 'Chino Pants', 50, 59.99)
      `);

      // Order 5
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('5', 'ORD-2024-005', 'CLT-005', 'Classic Wear Ltd.', 'orders@classicwear.com', 5599.40, 'pending', '2024-01-28T16:30:00Z', '2024-01-28T16:30:00Z', '654 Classic Lane, Boston, MA 02101')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ('5', '7', 'Classic Blazer', 20, 179.99),
        ('5', '11', 'Polo Shirt', 40, 49.99)
      `);

      // Order 6
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('6', 'ORD-2024-006', 'CLT-006', 'Seasonal Styles', 'buying@seasonalstyles.com', 4599.60, 'completed', '2024-01-10T08:00:00Z', '2024-01-15T12:00:00Z', '987 Season Ave, Seattle, WA 98101')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ('6', '12', 'Trench Coat', 15, 189.99),
        ('6', '8', 'Pleated Midi Skirt', 25, 69.99)
      `);

      // Order 7
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('7', 'ORD-2024-007', 'CLT-007', 'Metro Fashion Group', 'procurement@metrofashion.com', 7249.70, 'pending', '2024-01-29T13:45:00Z', '2024-01-29T13:45:00Z', '111 Metro Center, Denver, CO 80201')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ('7', '1', 'Premium Leather Jacket', 5, 299.99),
        ('7', '4', 'Elegant Evening Dress', 10, 199.99),
        ('7', '9', 'Cashmere Sweater', 15, 249.99)
      `);

      // Order 8
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('8', 'ORD-2024-008', 'CLT-008', 'Coastal Apparel', 'orders@coastalapparel.com', 7198.60, 'completed', '2024-01-05T10:00:00Z', '2024-01-10T16:00:00Z', '222 Coastal Drive, San Diego, CA 92101')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ('8', '6', 'Wool Blend Hoodie', 60, 79.99),
        ('8', '2', 'Cotton Basic Tee', 80, 29.99)
      `);
    }

    dbInitialized = true;
    console.log("Database initialized successfully");
  } catch (error: any) {
    if (isDbAuthError(error) && process.env.NODE_ENV !== "production") {
      enableMockDb(error);
      return;
    }

    console.error("Error during database initialization:", error);
    throw error;
  }
}

export default pool;
