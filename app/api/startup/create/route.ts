import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as { id: string }

    const body = await request.json()
    const { name, industry, fundingGoal, description, website } = body

    // Validation
    if (!name || !industry || !fundingGoal) {
      return NextResponse.json(
        { error: 'Missing required fields: name, industry, fundingGoal' },
        { status: 400 }
      )
    }

    // Check if user already has a startup
    const existingStartup = await prisma.startup.findUnique({
      where: { ownerId: decoded.id },
    })

    if (existingStartup) {
      return NextResponse.json(
        { error: 'You already have a startup registered' },
        { status: 409 }
      )
    }

    // Create startup
    const startup = await prisma.startup.create({
      data: {
        name,
        industry,
        fundingGoal: parseFloat(fundingGoal),
        description,
        website,
        ownerId: decoded.id,
      },
    })

    return NextResponse.json(
      {
        message: 'Startup created successfully',
        startup,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Startup creation error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create startup' },
      { status: 500 }
    )
  }
}
