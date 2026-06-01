import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import MOCK_PRODUCTS from "@/lib/mock/products";

export async function GET() {
  try {
    const res = await query(
      'SELECT id, sku, name, description, price, stock, category, image, min_stock AS "minStock" FROM products ORDER BY name ASC',
    );

    // Convert numeric strings to numbers for pricing and stock
    const products = res.rows.map((row) => ({
      ...row,
      price: parseFloat(row.price),
      stock: parseInt(row.stock),
      minStock: parseInt(row.minStock),
    }));

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Error in products GET API:", error);
    // Fallback to mocked products so UI can render while DB is down
    return NextResponse.json({ products: MOCK_PRODUCTS, _mock: true });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, delta } = await request.json();

    if (!id || typeof delta !== "number") {
      return NextResponse.json(
        { error: "Product id and delta quantity are required" },
        { status: 400 },
      );
    }

    const res = await query(
      'UPDATE products SET stock = GREATEST(0, stock + $1) WHERE id = $2 RETURNING id, sku, name, description, price, stock, category, image, min_stock AS "minStock"',
      [delta, id],
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = {
      ...res.rows[0],
      price: parseFloat(res.rows[0].price),
      stock: parseInt(res.rows[0].stock),
      minStock: parseInt(res.rows[0].minStock),
    };

    return NextResponse.json({ product: updatedProduct });
  } catch (error: any) {
    console.error("Error in products PATCH API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
export const dynamic = "force-dynamic";
