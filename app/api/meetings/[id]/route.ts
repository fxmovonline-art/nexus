import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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
    return null;
  }
}

// PATCH: Update meeting status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params;

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    const body = await request.json();
    const { status } = body;

    // Validate meetingId
    if (!meetingId) {
      console.error('Meeting ID is missing!');
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Validate status
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    if (!['ACCEPTED', 'REJECTED', 'PENDING', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ACCEPTED, REJECTED, PENDING, COMPLETED' },
        { status: 400 }
      );
    }

    // Get meeting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        startup: true,
        entrepreneur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        investor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Only the entrepreneur can update the meeting status
    if (meeting.entrepreneurId !== userId) {
      return NextResponse.json(
        { error: 'Only the entrepreneur can update the meeting status' },
        { status: 403 }
      );
    }

    // Only allow status changes to ACCEPTED or REJECTED
    if (status !== 'ACCEPTED' && status !== 'REJECTED') {
      return NextResponse.json(
        { error: 'Can only change status to ACCEPTED or REJECTED' },
        { status: 400 }
      );
    }

    // Update meeting status
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status,
        // Set meetingLink when status is ACCEPTED
        ...(status === 'ACCEPTED' && { meetingLink: `/meeting/${meetingId}` }),
      },
      include: {
        startup: true,
        entrepreneur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        investor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      }
    });

    return NextResponse.json(
      {
        message: `Meeting status updated to ${status}`,
        meeting: updatedMeeting
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update meeting:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update meeting: ${errorMsg}` },
      { status: 500 }
    );
  }
}

// GET: Fetch a specific meeting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params;

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        startup: true,
        entrepreneur: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        investor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      }
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Meeting fetched successfully',
        meeting
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch meeting:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch meeting: ${errorMsg}` },
      { status: 500 }
    );
  }
}
