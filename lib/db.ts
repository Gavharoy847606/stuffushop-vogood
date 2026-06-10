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

export async function query(text: string, params?: any[]) {
  if (!dbInitialized) {
    await initDb();
  }
  return pool.query(text, params);
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

    // Create Orders table (use integer SERIAL id to match existing DBs)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
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

    // Create Order Items table (order_id should match orders.id type)
    try {
      await pool.query(`
          CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INT REFERENCES orders(id) ON DELETE CASCADE,
            product_id VARCHAR(50) NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            quantity INT NOT NULL,
            price NUMERIC(10, 2) NOT NULL
          )
        `);
    } catch (fkError: any) {
      // Some Postgres instances may have existing `orders.id` as integer.
      // If the FK cannot be implemented due to type mismatch, create the
      // order_items table without a foreign key so the app can operate.
      if (fkError && fkError.code === "42804") {
        console.warn(
          "Foreign key on order_items could not be implemented; creating table without FK",
        );
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
              id SERIAL PRIMARY KEY,
              order_id VARCHAR(50),
              product_id VARCHAR(50) NOT NULL,
              product_name VARCHAR(255) NOT NULL,
              quantity INT NOT NULL,
              price NUMERIC(10, 2) NOT NULL
            )
          `);
      } else {
        throw fkError;
      }
    }

    // Seed Users if empty
    const usersCount = await pool.query("SELECT COUNT(*) FROM clents");
    if (parseInt(usersCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO clents (id, email, password, name, role, avatar) VALUES
        ('1', 'admin@gmail.com', 'admin', 'Admin User', 'admin', 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=face'),
        ('2', 'anvar.admin@erp.com', 'password123', 'Anvar Admin', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'),
        ('3', 'manager@erp.com', 'password123', 'Maria Manager', 'manager', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'),
        ('4', 'employee@erp.com', 'password123', 'John Employee', 'employee', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face')
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
        ('11', 'PLO-011', 'Polo Shirt', 'Classic polo shirt', 49.99, 0, 'Tops', 'https://www.harmontblaine.com/on/demandware.static/-/Sites-harmont-m-catalog/default/dwc73c149d/images/large/LN1010N21054_999_1.jpg', 20),
        ('12', 'CTN-012', 'Polo Shirt', 'Polo shirt', 49.99, 0, 'Tops', 'https://www.harmontblaine.com/on/demandware.static/-/Sites-harmont-m-catalog/default/dwc73c149d/images/large/LN1010N21054_999_1.jpg', 20),
        ('13', 'CTN-013', 'Trench Coat', 'Waterproof trench coat', 189.99, 7, 'Outerwear', 'https://images.unsplash.com/photo-1544923246-77307dd628b7?w=400&h=400&fit=crop', 5)
        ('11', 'CTN-014', 'Trench Coat', 'Waterproof trench coat', 189.99, 7, 'Outerwear', 'https://rheacosta-shop.com/cdn/shop/files/2964-marlene-camel-trench-coat-dress-gallery-2.jpg?v=1712066159&width=1080', 6)
      `);
    }

    // Seed Orders and Order Items if empty
    const ordersCount = await pool.query("SELECT COUNT(*) FROM orders");
    if (parseInt(ordersCount.rows[0].count) === 0) {
      // Order 1
      await pool.query(`
        INSERT INTO orders (order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('ORD-2024-001', 'CLT-001', 'Fashion Forward LLC', 'orders@fashionforward.com', 5249.65, 'completed', '2024-01-15T10:30:00Z', '2024-01-18T14:20:00Z', '123 Fashion Ave, New York, NY 10001')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ((SELECT id FROM orders WHERE order_number='ORD-2024-001'), '1', 'Premium Leather Jacket', 10, 299.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-001'), '3', 'Slim Fit Denim', 25, 89.99)
      `);

      // Order 2
      await pool.query(`
        INSERT INTO orders (order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('ORD-2024-002', 'CLT-002', 'Urban Style Co.', 'purchasing@urbanstyle.com', 8899.20, 'pending', '2024-01-20T09:15:00Z', '2024-01-20T09:15:00Z', '456 Urban Blvd, Los Angeles, CA 90001')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ((SELECT id FROM orders WHERE order_number='ORD-2024-002'), '5', 'Urban Sneakers', 50, 129.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-002'), '6', 'Wool Blend Hoodie', 30, 79.99)
      `);

      // Order 3
      await pool.query(`
        INSERT INTO orders (order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('ORD-2024-003', 'CLT-003', 'Elite Boutique', 'orders@eliteboutique.com', 7999.65, 'processing', '2024-01-22T11:45:00Z', '2024-01-23T08:30:00Z', '789 Elite Plaza, Miami, FL 33101')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ((SELECT id FROM orders WHERE order_number='ORD-2024-003'), '4', 'Elegant Evening Dress', 15, 199.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-003'), '9', 'Cashmere Sweater', 20, 249.99)
      `);

      // Order 4
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('ORD-2024-004', 'CLT-004', 'Trendy Threads Inc.', 'supply@trendythreads.com', 5998.50, 'shipped', '2024-01-25T14:00:00Z', '2024-01-27T10:15:00Z', '321 Trend Street, Chicago, IL 60601')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ((SELECT id FROM orders WHERE order_number='ORD-2024-004'), '2', 'Cotton Basic Tee', 100, 29.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-004'), '10', 'Chino Pants', 50, 59.99)
      `);

      // Order 5
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('ORD-2024-005', 'CLT-005', 'Classic Wear Ltd.', 'orders@classicwear.com', 5599.40, 'pending', '2024-01-28T16:30:00Z', '2024-01-28T16:30:00Z', '654 Classic Lane, Boston, MA 02101')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ((SELECT id FROM orders WHERE order_number='ORD-2024-005'), '7', 'Classic Blazer', 20, 179.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-005'), '11', 'Polo Shirt', 40, 49.99)
      `);

      // Order 6
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('ORD-2024-006', 'CLT-006', 'Seasonal Styles', 'buying@seasonalstyles.com', 4599.60, 'completed', '2024-01-10T08:00:00Z', '2024-01-15T12:00:00Z', '987 Season Ave, Seattle, WA 98101')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ((SELECT id FROM orders WHERE order_number='ORD-2024-006'), '12', 'Trench Coat', 15, 189.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-006'), '8', 'Pleated Midi Skirt', 25, 69.99)
      `);

      // Order 7
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('ORD-2024-007', 'CLT-007', 'Metro Fashion Group', 'procurement@metrofashion.com', 7249.70, 'pending', '2024-01-29T13:45:00Z', '2024-01-29T13:45:00Z', '111 Metro Center, Denver, CO 80201')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ((SELECT id FROM orders WHERE order_number='ORD-2024-007'), '1', 'Premium Leather Jacket', 5, 299.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-007'), '4', 'Elegant Evening Dress', 10, 199.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-007'), '9', 'Cashmere Sweater', 15, 249.99)
      `);

      // Order 8
      await pool.query(`
        INSERT INTO orders (id, order_number, client_id, client_name, client_email, total_amount, status, created_at, updated_at, shipping_address)
        VALUES ('ORD-2024-008', 'CLT-008', 'Coastal Apparel', 'orders@coastalapparel.com', 7198.60, 'completed', '2024-01-05T10:00:00Z', '2024-01-10T16:00:00Z', '222 Coastal Drive, San Diego, CA 92101')
      `);
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
        ((SELECT id FROM orders WHERE order_number='ORD-2024-008'), '6', 'Wool Blend Hoodie', 60, 79.99),
        ((SELECT id FROM orders WHERE order_number='ORD-2024-008'), '2', 'Cotton Basic Tee', 80, 29.99)
      `);
    }

    dbInitialized = true;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error during database initialization:", error);
    // Prevent repeated initialization attempts during runtime; rely on
    // API-level mock fallbacks when DB is unavailable or schema mismatched.
    dbInitialized = true;
    return;
  }
}

export default pool;
