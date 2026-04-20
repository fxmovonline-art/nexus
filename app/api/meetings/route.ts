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

// GET: Fetch user meetings
export async function GET(request: NextRequest) {
  try {
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

    // Get user details to determine their type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let meetings;
    if (user.userType === 'investor') {
      // Investor: fetch meetings where they are the investor
      meetings = await prisma.meeting.findMany({
        where: { investorId: userId },
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
        },
        orderBy: { startTime: 'asc' },
      });
    } else {
      // Entrepreneur: fetch meetings where they are the entrepreneur
      meetings = await prisma.meeting.findMany({
        where: { entrepreneurId: userId },
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
        },
        orderBy: { startTime: 'asc' },
      });
    }

    return NextResponse.json(
      {
        message: 'Meetings fetched successfully',
        meetings,
        total: meetings.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch meetings: ${errorMsg}` },
      { status: 500 }
    );
  }
}

// POST: Schedule a meeting
export async function POST(request: NextRequest) {
  try {
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
    const { investorId, entrepreneurId, startupId, title, description, startTime, endTime, meetingLink } = body;

    // Validate required fields
    if (!investorId || !entrepreneurId || !startupId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: investorId, entrepreneurId, startupId, title, startTime, endTime' },
        { status: 400 }
      );
    }

    // Parse and validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format for startTime or endTime' },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'startTime must be before endTime' },
        { status: 400 }
      );
    }

    // Verify startup exists and belongs to the entrepreneur
    const startup = await prisma.startup.findUnique({
      where: { id: startupId }
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    if (startup.ownerId !== entrepreneurId) {
      return NextResponse.json(
        { error: 'Startup does not belong to the specified entrepreneur' },
        { status: 403 }
      );
    }

    // CONFLICT CHECK: Check if entrepreneur already has a meeting in the same time slot
    const conflictingMeeting = await prisma.meeting.findFirst({
      where: {
        entrepreneurId,
        status: {
          in: ['PENDING', 'ACCEPTED']
        },
        // Check for time overlap: new meeting starts before existing ends AND new meeting ends after existing starts
        startTime: { lt: end },
        endTime: { gt: start }
      }
    });

    if (conflictingMeeting) {
      return NextResponse.json(
        { error: 'Time slot already booked' },
        { status: 400 }
      );
    }

    // Create meeting
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        startTime: start,
        endTime: end,
        meetingLink: meetingLink || null,
        status: 'PENDING',
        entrepreneurId,
        investorId,
        startupId,
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
      },
    });

    return NextResponse.json(
      {
        message: 'Meeting scheduled successfully',
        meeting
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to schedule meeting:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to schedule meeting: ${errorMsg}` },
      { status: 500 }
    );
  }
}
