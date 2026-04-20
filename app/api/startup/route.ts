import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const search = searchParams.get('search')

    console.log('[Startup API] GET: Fetching startups with filters:', { industry, search })

    let whereClause: any = {}

    if (industry && industry !== 'All') {
      whereClause.industry = industry
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ]
    }

    const startups = await prisma.startup.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log('[Startup API] GET: Found', startups.length, 'startups')

    return NextResponse.json(
      {
        startups: startups.map(startup => ({
          id: startup.id,
          name: startup.name,
          description: startup.description,
          industry: startup.industry,
          fundingGoal: startup.fundingGoal,
          amountRaised: startup.amountRaised,
          website: startup.website,
          pitchDeckUrl: startup.pitchDeckUrl,
          pitchDeckName: startup.pitchDeckName,
          createdAt: startup.createdAt,
          owner: {
            firstName: startup.owner?.firstName || '',
            lastName: startup.owner?.lastName || '',
            email: startup.owner?.email || '',
          },
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Startup API] GET: Error:', error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    return NextResponse.json(
      { error: 'Failed to fetch startups', details: errorMessage },
      { status: 500 }
    )
  }
}

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

    // Verify token and extract userId
    let userId: string
    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || 'your-secret-key'
      ) as { id: string }
      userId = decoded.id
      console.log('[Startup API] Token verified for user:', userId)
    } catch (error) {
      console.error('[Startup API] Token verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, industry, description, fundingGoal, website, pitchDeckUrl, pitchDeckName } = body
    console.log('[Startup API] Request body:', { name, industry, fundingGoal })

    // Validation
    if (!name?.trim() || !industry || !fundingGoal) {
      return NextResponse.json(
        { error: 'Missing required fields: name, industry, fundingGoal' },
        { status: 400 }
      )
    }

    // Validate fundingGoal is a valid number
    const fundingAmount = parseFloat(fundingGoal)
    if (isNaN(fundingAmount) || fundingAmount <= 0) {
      return NextResponse.json(
        { error: 'Funding goal must be a valid positive number' },
        { status: 400 }
      )
    }

    // Check if user already has a startup
    console.log('[Startup API] Checking if user already has startup...')
    const existingStartup = await prisma.startup.findUnique({
      where: { ownerId: userId },
    })

    if (existingStartup) {
      console.log('[Startup API] User already has a startup')
      return NextResponse.json(
        { error: 'You already have a startup registered' },
        { status: 409 }
      )
    }

    // Create startup linked to authenticated user
    console.log('[Startup API] Creating startup...')
    const startup = await prisma.startup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        industry,
        fundingGoal: fundingAmount,
        website: website?.trim() || '',
        pitchDeckUrl: pitchDeckUrl || null,
        pitchDeckName: pitchDeckName || null,
        ownerId: userId, // Automatically link to authenticated user
      },
    })

    console.log('[Startup API] Startup created successfully:', startup.id)
    return NextResponse.json(
      {
        message: 'Startup registered successfully',
        startup,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Startup API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('[Startup API] Detailed error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to create startup. Please try again.', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Verify token and extract userId
    let userId: string
    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || 'your-secret-key'
      ) as { id: string }
      userId = decoded.id
      console.log('[Startup API] DELETE: Token verified for user:', userId)
    } catch (error) {
      console.error('[Startup API] DELETE: Token verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user has a startup
    console.log('[Startup API] DELETE: Checking for startup...')
    const existingStartup = await prisma.startup.findUnique({
      where: { ownerId: userId },
    })

    if (!existingStartup) {
      console.log('[Startup API] DELETE: No startup found for user')
      return NextResponse.json(
        { error: 'No startup found to delete' },
        { status: 404 }
      )
    }

    // Delete the startup
    console.log('[Startup API] DELETE: Deleting startup:', existingStartup.id)
    const deletedStartup = await prisma.startup.delete({
      where: { id: existingStartup.id },
    })

    console.log('[Startup API] DELETE: Startup deleted successfully')
    return NextResponse.json(
      {
        message: 'Startup deleted successfully',
        startup: deletedStartup,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Startup API] DELETE: Error:', error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('[Startup API] DELETE: Detailed error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to delete startup. Please try again.', details: errorMessage },
      { status: 500 }
    )
  }
}
