import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

interface JwtPayload {
  userId: string;
  email: string;
}

function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

function validateAndNormalizeUrl(urlString: string): string {
  console.log('[Update Doc API] Received URL:', urlString);
  
  if (!urlString) {
    throw new Error('URL is required');
  }

  // Already a full URL with https://
  if (urlString.startsWith('https://')) {
    console.log('[Update Doc API] URL is already absolute (https):', urlString);
    return urlString;
  }

  // Already a full URL with http://
  if (urlString.startsWith('http://')) {
    console.log('[Update Doc API] URL is already absolute (http):', urlString);
    return urlString;
  }

  // UploadThing file key format with leading slash
  if (urlString.startsWith('/')) {
    const normalizedUrl = `https://utfs.io/f${urlString}`;
    console.log('[Update Doc API] Converted relative path to:', normalizedUrl);
    return normalizedUrl;
  }

  // Assume it's a file key, prefix with UploadThing CDN
  const uploadThingUrl = `https://utfs.io/f/${urlString}`;
  console.log('[Update Doc API] Converted file key to:', uploadThingUrl);
  return uploadThingUrl;
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('[Update Doc API] PATCH request started');
    
    const token = getTokenFromRequest(request);
    if (!token) {
      console.error('[Update Doc API] No token provided');
      return NextResponse.json(
        { error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.error('[Update Doc API] Token verification failed');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    console.log('[Update Doc API] Token verified for userId:', userId);
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[Update Doc API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { fileUrl, fileName } = body;

    console.log('[Update Doc API] Request received - userId:', userId);
    console.log('[Update Doc API] fileName:', fileName);
    console.log('[Update Doc API] fileUrl:', fileUrl?.substring(0, 50) + '...');

    if (!fileUrl || !fileName) {
      console.error('[Update Doc API] Missing required fields - fileUrl:', !!fileUrl, 'fileName:', !!fileName);
      return NextResponse.json(
        { error: 'Missing fileUrl or fileName' },
        { status: 400 }
      );
    }

    // Validate and normalize the URL
    let normalizedUrl;
    try {
      normalizedUrl = validateAndNormalizeUrl(fileUrl);
      console.log('[Update Doc API] URL normalized successfully');
    } catch (urlError) {
      console.error('[Update Doc API] URL validation failed:', urlError);
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      );
    }

    console.log('[Update Doc API] Saving URL to DB:', normalizedUrl?.substring(0, 50) + '...');
    console.log('[Update Doc API] File name:', fileName);

    // Find the startup owned by this user
    let startup;
    try {
      startup = await prisma.startup.findUnique({
        where: { ownerId: userId },
      });
    } catch (dbError) {
      console.error('[Update Doc API] Database error fetching startup:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!startup) {
      console.error('[Update Doc API] No startup found for user:', userId);
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    console.log('[Update Doc API] Found startup:', startup.id, '- Current PDF URL:', startup.pitchDeckUrl?.substring(0, 30) + '...');

    // Update the startup with the new pitch deck information
    let updatedStartup;
    try {
      updatedStartup = await prisma.startup.update({
        where: { id: startup.id },
        data: {
          pitchDeckUrl: normalizedUrl,
          pitchDeckName: fileName,
        },
      });
    } catch (updateError) {
      console.error('[Update Doc API] Database error updating startup:', updateError);
      return NextResponse.json(
        { error: 'Failed to update startup' },
        { status: 500 }
      );
    }

    console.log('[Update Doc API] Startup updated successfully');
    console.log('[Update Doc API] Saved PDF URL:', updatedStartup.pitchDeckUrl?.substring(0, 50) + '...');
    console.log('[Update Doc API] Saved PDF Name:', updatedStartup.pitchDeckName);

    const responseData = {
      success: true,
      startup: updatedStartup,
      message: 'Document saved successfully'
    };
    
    console.log('[Update Doc API] Returning success response');
    return NextResponse.json(responseData, { status: 200 });
    
  } catch (error) {
    console.error('[Update Doc API] Unexpected error:', error);
    console.error('[Update Doc API] Error type:', typeof error);
    console.error('[Update Doc API] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[Update Doc API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
