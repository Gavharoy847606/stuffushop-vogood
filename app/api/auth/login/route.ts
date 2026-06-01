import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

const FALLBACK_USERS = [
  {
    id: '1',
    email: 'admin@gmail.com',
    password: 'admin',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '2',
    email: 'anvar.admin@erp.com',
    password: 'password123',
    name: 'Anvar Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  }
]

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const res = await query('SELECT * FROM clents WHERE LOWER(email) = LOWER($1)', [email])

    let user = res.rows[0]

    if (!user) {
      user = FALLBACK_USERS.find(
        (fallback) => fallback.email.toLowerCase() === email.toLowerCase(),
      )
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

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
