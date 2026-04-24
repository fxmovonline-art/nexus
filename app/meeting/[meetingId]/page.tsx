'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const kitRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get meeting ID from URL params
    const meetingId = params.meetingId as string;

    // Initialize ZegoUIKitPrebuilt
    const zegoCalling = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user from localStorage (custom JWT auth)
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setError('User not authenticated. Please login first.');
          router.push('/auth/login');
          return;
        }

        const user: User = JSON.parse(userStr);
        const userName = `${user.firstName} ${user.lastName}`;
        const userId = user.email;

        // Check if ZEGO credentials are configured
        const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID;
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
          setError('Video call service is not properly configured. Please contact support.');
          console.error('Missing ZEGO credentials:', { appID: !!appID, serverSecret: !!serverSecret });
          return;
        }

        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
        
        // Create kit instance
        kitRef.current = ZegoUIKitPrebuilt.create(
          ZegoUIKitPrebuilt.generateKitTokenForTest(
            parseInt(appID),
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

        setIsLoading(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load video call';
        console.error('Failed to initialize video call:', error);
        setError(`Failed to start video call: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    zegoCalling();

    // Cleanup on unmount
    return () => {
      if (kitRef.current) {
        kitRef.current.destroy();
      }
    };
  }, [params.meetingId, router]);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      />
      
      {/* Error Message */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Initializing video call...</p>
          </div>
        </div>
      )}
    </>
  );
}
