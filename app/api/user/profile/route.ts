import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Get token from request headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    let userId: string
    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || 'your-secret-key'
      ) as { id: string }
      userId = decoded.id
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Fetch user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        startup: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('User profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile. Please try again.' },
      { status: 500 }
    )
  }
}
