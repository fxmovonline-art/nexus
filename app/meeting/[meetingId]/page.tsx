'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const kitRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get meeting ID from URL params
    const meetingId = params.meetingId as string;

    // Get user info from session or use fallback
    const userName = session?.user?.name || 'Guest User';
    const userId = session?.user?.email || "guest-" + Date.now();

    // Initialize ZegoUIKitPrebuilt
    const zegoCalling = async () => {
      try {
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
        
        // Generate token (in production, generate this from your backend)
        const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';

        // Create kit instance
        kitRef.current = ZegoUIKitPrebuilt.create(
          ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            meetingId,
            userId,
            userName
          )
        );

        // Initialize the call
        kitRef.current.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          onLeaveRoom: () => {
            router.push('/dashboard');
          },
          showLeaveButton: true,
        });
      } catch (error) {
        console.error('Failed to load ZegoUIKitPrebuilt', error);
      }
    };

    zegoCalling();

    // Cleanup on unmount
    return () => {
      if (kitRef.current) {
        kitRef.current.destroy();
      }
    };
  }, [params.meetingId, session, router]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    />
  );
}
