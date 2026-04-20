import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email?: string;
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    ) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('[Investments/Get] Token verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const token = getTokenFromRequest(request);
    console.log('[Investments/Get] Token received:', !!token);

    if (!token) {
      console.log('[Investments/Get] No token provided');
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log('[Investments/Get] Token decoded:', decoded);

    if (!decoded) {
      console.log('[Investments/Get] Invalid or expired token');
      return NextResponse.json(
        { error: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    const entrepreneurId = decoded.id;

    // Get entrepreneur's startup
    console.log('[Investments/Get] Fetching startup for entrepreneur:', entrepreneurId);
    const startup = await prisma.startup.findUnique({
      where: { ownerId: entrepreneurId },
      select: { id: true },
    });

    if (!startup) {
      console.log('[Investments/Get] No startup found for entrepreneur');
      return NextResponse.json(
        {
          investments: [],
          totalFunding: 0,
          investmentCount: 0,
        }
      );
    }

    // Fetch all investments for this startup with investor details
    console.log('[Investments/Get] Fetching investments for startup:', startup.id);
    const investments = await prisma.investment.findMany({
      where: {
        startupId: startup.id,
        status: 'COMPLETED', // Only show completed investments
      },
      include: {
        investor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[Investments/Get] Found investments:', investments.length);

    // Calculate total funding
    const totalFunding = investments.reduce((sum, inv) => sum + inv.amount, 0);

    // Format response
    const formattedInvestments = investments.map((inv) => ({
      id: inv.id,
      investorName: `${inv.investor.firstName} ${inv.investor.lastName}`.trim(),
      investorEmail: inv.investor.email,
      amount: inv.amount,
      date: inv.createdAt,
      status: inv.status,
    }));

    return NextResponse.json({
      investments: formattedInvestments,
      totalFunding,
      investmentCount: investments.length,
    });
  } catch (error) {
    console.error('[Investments/Get] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch investments';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
