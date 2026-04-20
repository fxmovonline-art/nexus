import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
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
    console.error('Token verification error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const token = getTokenFromRequest(request);
    console.log('[Checkout] Token received:', !!token);

    if (!token) {
      console.log('[Checkout] No token provided');
      return NextResponse.json(
        { error: 'Please login first' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log('[Checkout] Token decoded:', decoded);

    if (!decoded) {
      console.log('[Checkout] Invalid or expired token');
      return NextResponse.json(
        { error: 'Session expired. Please login again' },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    const { amount, startupId } = await request.json();

    if (!amount || !startupId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, startupId' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    console.log('[Checkout] Creating Stripe session for:', { userId, startupId, amount });

    // Verify Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Checkout] STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Investment',
              description: `Investment in startup ${startupId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&startupId=${startupId}&amount=${amount}`,
      cancel_url: `${baseUrl}/explore`,
      metadata: {
        startupId,
        investorId: userId,
      },
    });

    console.log('[Checkout] Stripe session created:', checkoutSession.id);

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('[Checkout] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
