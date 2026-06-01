import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { MOCK_ORDERS } from "@/lib/mock/orders";

export async function GET() {
  try {
    const ordersRes = await query(`
      SELECT 
        id, 
        order_number AS "orderNumber", 
        client_id AS "clientId", 
        client_name AS "clientName", 
        client_email AS "clientEmail", 
        total_amount AS "totalAmount", 
        status, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt", 
        shipping_address AS "shippingAddress" 
      FROM orders 
      ORDER BY created_at DESC
    `);

    const itemsRes = await query(`
      SELECT 
        order_id AS "orderId", 
        product_id AS "productId", 
        product_name AS "productName", 
        quantity, 
        price 
      FROM order_items
    `);

    const orders = ordersRes.rows.map((order) => {
      const items = itemsRes.rows
        .filter((item) => item.orderId === order.id)
        .map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        }));

      return {
        ...order,
        totalAmount: parseFloat(order.totalAmount),
        items,
      };
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error in orders GET API:", error);
    // Fallback: return generated mock orders so the dashboard can still render
    return NextResponse.json({ orders: MOCK_ORDERS, _mock: true });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Order id and status are required" },
        { status: 400 },
      );
    }

    const res = await query(
      `
      UPDATE orders 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING 
        id, 
        order_number AS "orderNumber", 
        client_id AS "clientId", 
        client_name AS "clientName", 
        client_email AS "clientEmail", 
        total_amount AS "totalAmount", 
        status, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt", 
        shipping_address AS "shippingAddress"
    `,
      [status, id],
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = {
      ...res.rows[0],
      totalAmount: parseFloat(res.rows[0].totalAmount),
      items: [], // In the UI store, updating status keeps items intact, or we can fetch items
    };

    // Fetch items for this order to return complete record
    const itemsRes = await query(
      `
      SELECT 
        product_id AS "productId", 
        product_name AS "productName", 
        quantity, 
        price 
      FROM order_items 
      WHERE order_id = $1
    `,
      [id],
    );

    updatedOrder.items = itemsRes.rows.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price),
    }));

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Error in orders PATCH API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
export const dynamic = "force-dynamic";
