import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    await query("TRUNCATE TABLE order_items, orders, products CASCADE;");
    return NextResponse.json({ message: "Database truncated successfully! Reload the app to re-seed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
