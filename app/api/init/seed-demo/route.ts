import prisma from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check if demo accounts already exist
    const existingDemo = await prisma.user.findUnique({
      where: { email: 'demo@entrepreneur.com' },
    })

    if (existingDemo) {
      return NextResponse.json(
        { message: 'Demo accounts already exist' },
        { status: 200 }
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash('demo123456', 10)

    // Create demo entrepreneur
    await prisma.user.create({
      data: {
        email: 'demo@entrepreneur.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'Entrepreneur',
        userType: 'entrepreneur',
      },
    })

    // Create demo investor
    await prisma.user.create({
      data: {
        email: 'demo@investor.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'Investor',
        userType: 'investor',
      },
    })

    return NextResponse.json(
      {
        message: 'Demo accounts created successfully',
        accounts: [
          {
            email: 'demo@entrepreneur.com',
            password: 'demo123456',
            type: 'entrepreneur',
          },
          {
            email: 'demo@investor.com',
            password: 'demo123456',
            type: 'investor',
          },
        ],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Demo seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to create demo accounts' },
      { status: 500 }
    )
  }
}
