'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ConfirmResponse {
  success: boolean;
  message: string;
  investment?: {
    id: string;
    amount: number;
    startupName: string;
  };
  error?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your payment...');
  const [investmentData, setInvestmentData] = useState<any>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Get parameters from URL
        const sessionId = searchParams.get('session_id');
        const startupId = searchParams.get('startupId');
        const amount = searchParams.get('amount');

        console.log('[Success Page] Parameters:', { sessionId, startupId, amount });

        if (!sessionId || !startupId || !amount) {
          setStatus('error');
          setMessage('Missing payment information. Please contact support.');
          return;
        }

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setStatus('error');
          setMessage('Not authenticated. Please login again.');
          return;
        }

        // Call the confirm API
        console.log('[Success Page] Calling /api/investments/confirm');
        const response = await fetch('/api/investments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId,
            startupId,
            amount: parseFloat(amount),
          }),
        });

        const data: ConfirmResponse = await response.json();
        console.log('[Success Page] Response:', data);

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Payment successful! Your investment has been recorded.');
          setInvestmentData(data.investment);
        } else {
          setStatus('error');
          setMessage(data.error || data.message || 'Failed to confirm payment');
        }
      } catch (error) {
        console.error('[Success Page] Error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Payment Failed</h1>
          <p className="text-gray-600 text-center mb-6">{message}</p>
          <div className="flex gap-4">
            <Link
              href="/explore"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-center font-medium"
            >
              Back to Explore
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300 text-center font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Payment Successful!</h1>
        <p className="text-gray-600 text-center mb-6">Your investment has been recorded successfully.</p>

        {investmentData && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Company:</span> {investmentData.startupName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Amount:</span> ${investmentData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        <Link
          href="/dashboard"
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 text-center font-medium block mb-3"
        >
          Go to My Dashboard
        </Link>

        <Link
          href="/explore"
          className="w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-300 text-center font-medium block"
        >
          Continue Exploring
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
