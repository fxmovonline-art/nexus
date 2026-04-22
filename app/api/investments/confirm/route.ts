import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

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
    console.error('[Investments/Confirm] Token verification error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const token = getTokenFromRequest(request);
    console.log('[Investments/Confirm] Token received:', !!token);

    if (!token) {
      console.log('[Investments/Confirm] No token provided');
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log('[Investments/Confirm] Token decoded:', decoded);

    if (!decoded) {
      console.log('[Investments/Confirm] Invalid or expired token');
      return NextResponse.json(
        { success: false, error: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    const investorId = decoded.id;
    const { sessionId, startupId, amount } = await request.json();

    console.log('[Investments/Confirm] Request data:', { sessionId, startupId, amount, investorId });

    // Validate required fields
    if (!sessionId || !startupId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, startupId, amount' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify Stripe session and payment status
    console.log('[Investments/Confirm] Retrieving Stripe session:', sessionId);
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('[Investments/Confirm] Stripe session status:', stripeSession.payment_status);

    if (!stripeSession) {
      return NextResponse.json(
        { success: false, error: 'Stripe session not found' },
        { status: 404 }
      );
    }

    if (stripeSession.payment_status !== 'paid') {
      console.log('[Investments/Confirm] Payment not completed. Status:', stripeSession.payment_status);
      return NextResponse.json(
        { success: false, error: 'Payment not completed. Please try again.' },
        { status: 400 }
      );
    }

    // Verify startup exists
    console.log('[Investments/Confirm] Verifying startup:', startupId);
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { id: true, name: true },
    });

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found' },
        { status: 404 }
      );
    }

    // Create investment record
    console.log('[Investments/Confirm] Creating investment record');
    const investment = await prisma.investment.create({
      data: {
        amount,
        status: 'COMPLETED',
        stripeSessionId: sessionId,
        investorId,
        startupId,
      },
    });

    console.log('[Investments/Confirm] Investment created:', investment.id);

    // Update startup's amountRaised
    await prisma.startup.update({
      where: { id: startupId },
      data: {
        amountRaised: {
          increment: amount,
        },
      },
    });

    console.log('[Investments/Confirm] Startup amount raised updated');

    return NextResponse.json({
      success: true,
      message: 'Investment confirmed successfully',
      investment: {
        id: investment.id,
        amount: investment.amount,
        startupName: startup.name,
      },
    });
  } catch (error) {
    console.error('[Investments/Confirm] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to confirm investment';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
