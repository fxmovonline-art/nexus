import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct object (for different Next.js versions)
    const resolvedParams = await Promise.resolve(params)
    const { id } = resolvedParams

    console.log('[Startup Detail API] Fetching startup:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'Startup ID is required' },
        { status: 400 }
      )
    }

    const startup = await prisma.startup.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
                bio: true,
                location: true,
                website: true,
                phone: true,
              },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
      },
    })

    if (!startup) {
      console.log('[Startup Detail API] Startup not found:', id)
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      )
    }

    console.log('[Startup Detail API] Startup found:', startup.name)

    return NextResponse.json(
      { startup },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Startup Detail API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('[Startup Detail API] Detailed error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to fetch startup details', details: errorMessage },
      { status: 500 }
    )
  }
}
