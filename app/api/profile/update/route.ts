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
    const { bio, location, avatarUrl, phone, website } = body

    // Find or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId: decoded.id },
    })

    if (profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId: decoded.id },
        data: {
          bio: bio || profile.bio,
          location: location || profile.location,
          avatarUrl: avatarUrl || profile.avatarUrl,
          phone: phone || profile.phone,
          website: website || profile.website,
        },
      })
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: decoded.id,
          bio,
          location,
          avatarUrl,
          phone,
          website,
        },
      })
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile update error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
