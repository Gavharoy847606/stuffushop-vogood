import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const res = await query('SELECT * FROM clents WHERE LOWER(email) = LOWER($1)', [email])

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = res.rows[0]

    // In production, we'd use bcrypt/argon2 to compare hashed passwords.
    // For this exact migration, we match the mock auth store password logic.
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Generate mock JWT
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }))
    const signature = btoa('mock-signature')
    const token = `${header}.${payload}.${signature}`

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      token
    })
  } catch (error: any) {
    console.error('Error in login API:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
