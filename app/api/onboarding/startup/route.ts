import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description, industry, fundingGoal, website } = body

    // Validation
    if (!name || !industry || !fundingGoal) {
      return NextResponse.json(
        { error: 'Missing required fields: name, industry, fundingGoal' },
        { status: 400 }
      )
    }

    // Check if user already has a startup
    const existingStartup = await prisma.startup.findUnique({
      where: { ownerId: userId },
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
        description,
        industry,
        fundingGoal: parseFloat(fundingGoal),
        website,
        ownerId: userId,
      },
    })

    return NextResponse.json(
      {
        message: 'Startup registered successfully',
        startup,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Startup creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create startup. Please try again.' },
      { status: 500 }
    )
  }
}
