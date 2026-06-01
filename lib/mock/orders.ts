// Lightweight mock orders generator for server + client fallbacks
// Produces realistic-looking orders spanning a number of years.

const PRODUCT_CATALOG = [
  { id: "1", name: "Premium Leather Jacket", price: 299.99 },
  { id: "2", name: "Cotton Basic Tee", price: 29.99 },
  { id: "3", name: "Slim Fit Denim", price: 89.99 },
  { id: "4", name: "Elegant Evening Dress", price: 199.99 },
  { id: "5", name: "Urban Sneakers", price: 129.99 },
  { id: "6", name: "Wool Blend Hoodie", price: 79.99 },
  { id: "7", name: "Classic Blazer", price: 179.99 },
  { id: "8", name: "Pleated Midi Skirt", price: 69.99 },
  { id: "9", name: "Cashmere Sweater", price: 249.99 },
  { id: "10", name: "Chino Pants", price: 59.99 },
  { id: "11", name: "Polo Shirt", price: 49.99 },
  { id: "12", name: "Trench Coat", price: 189.99 },
];

const CLIENTS = [
  {
    id: "CLT-001",
    name: "Fashion Forward LLC",
    email: "orders@fashionforward.com",
  },
  {
    id: "CLT-002",
    name: "Urban Style Co.",
    email: "purchasing@urbanstyle.com",
  },
  { id: "CLT-003", name: "Elite Boutique", email: "orders@eliteboutique.com" },
  {
    id: "CLT-004",
    name: "Trendy Threads Inc.",
    email: "supply@trendythreads.com",
  },
  { id: "CLT-005", name: "Classic Wear Ltd.", email: "orders@classicwear.com" },
  {
    id: "CLT-006",
    name: "Seasonal Styles",
    email: "buying@seasonalstyles.com",
  },
  {
    id: "CLT-007",
    name: "Metro Fashion Group",
    email: "procurement@metrofashion.com",
  },
  {
    id: "CLT-008",
    name: "Coastal Apparel",
    email: "orders@coastalapparel.com",
  },
];

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateMockOrders({ years = 5, total = 500, seed = 42 } = {}) {
  const rng = seededRandom(seed);
  const now = Date.now();
  const start = now - years * 365 * 24 * 60 * 60 * 1000;

  const orders: any[] = [];
  for (let i = 0; i < total; i++) {
    const ts = new Date(start + Math.floor(rng() * (now - start)));
    const client = pick(rng, CLIENTS);
    const itemCount = 1 + Math.floor(rng() * 4);
    const items: any[] = [];
    for (let j = 0; j < itemCount; j++) {
      const prod = pick(rng, PRODUCT_CATALOG);
      const qty = 1 + Math.floor(rng() * 100);
      items.push({
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        price: prod.price,
      });
    }

    const totalAmount = items.reduce((s, it) => s + it.quantity * it.price, 0);
    const statusPick = rng();
    let status = "completed";
    if (statusPick < 0.1) status = "cancelled";
    else if (statusPick < 0.35) status = "pending";
    else if (statusPick < 0.6) status = "processing";
    else if (statusPick < 0.8) status = "shipped";

    const id = `${ts.getTime()}-${i}`;
    const year = ts.getUTCFullYear();
    const orderNumber = `ORD-${year}-${String(i + 1).padStart(4, "0")}`;

    orders.push({
      id,
      orderNumber,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      items,
      totalAmount: Number(totalAmount.toFixed(2)),
      status,
      createdAt: ts.toISOString(),
      updatedAt: new Date(
        ts.getTime() + Math.floor(rng() * 10) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      shippingAddress: `${100 + Math.floor(rng() * 900)} Mock St, City ${Math.floor(rng() * 100)}, Country`,
    });
  }

  // sort newest first
  orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return orders;
}

export const MOCK_ORDERS = generateMockOrders({
  years: 5,
  total: 500,
  seed: 12345,
});
