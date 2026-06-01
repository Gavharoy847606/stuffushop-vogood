import { NextResponse } from "next/server";
import { query, findMockUserByEmail } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Query the database for the user
    const result = await query(
      "SELECT * FROM clents WHERE LOWER(email) = LOWER($1)",
      [email],
    );

    if (result.rows.length === 0) {
      // In development, fall back to mock users if DB has no matching user
      if (process.env.NODE_ENV !== "production") {
        const mockUser = findMockUserByEmail(email);
        if (mockUser && mockUser.password === password) {
          const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
          const payload = btoa(
            JSON.stringify({
              sub: mockUser.id,
              email: mockUser.email,
              role: mockUser.role,
              iat: Date.now(),
              exp: Date.now() + 24 * 60 * 60 * 1000,
            }),
          );
          const signature = btoa("mock-signature");
          const token = `${header}.${payload}.${signature}`;

          return NextResponse.json({
            user: {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              role: mockUser.role,
              avatar: mockUser.avatar,
            },
            token,
          });
        }
      }

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    // Simple password comparison (in production, use bcrypt)
    if (user.password !== password) {
      // In development, allow fallback to mock user if DB password mismatches
      if (process.env.NODE_ENV !== "production") {
        const mockUser = findMockUserByEmail(email);
        if (mockUser && mockUser.password === password) {
          const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
          const payload = btoa(
            JSON.stringify({
              sub: mockUser.id,
              email: mockUser.email,
              role: mockUser.role,
              iat: Date.now(),
              exp: Date.now() + 24 * 60 * 60 * 1000,
            }),
          );
          const signature = btoa("mock-signature");
          const token = `${header}.${payload}.${signature}`;

          return NextResponse.json({
            user: {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              role: mockUser.role,
              avatar: mockUser.avatar,
            },
            token,
          });
        }
      }

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Generate mock JWT
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }),
    );
    const signature = btoa("mock-signature");
    const token = `${header}.${payload}.${signature}`;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error: any) {
    console.error("Error in login API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
export const dynamic = "force-dynamic";
