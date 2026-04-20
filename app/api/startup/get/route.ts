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

    // Fetch startup for this user
    const startup = await prisma.startup.findUnique({
      where: { ownerId: userId },
    })

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        startup,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Startup fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch startup. Please try again.' },
      { status: 500 }
    )
  }
}
