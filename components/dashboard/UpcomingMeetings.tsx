'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: string;
  entrepreneur: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  investor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function UpcomingMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/meetings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Get upcoming meetings (next 3)
          const upcomingMeetings = data.meetings
            .filter(
              (meeting: Meeting) =>
                new Date(meeting.startTime) > new Date()
            )
            .slice(0, 3);
          setMeetings(upcomingMeetings);
        } else {
          setError('Failed to fetch meetings');
        }
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
        setError('Connection error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [token]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleMeetingAction = async (meetingId: string, action: 'ACCEPTED' | 'REJECTED') => {
    try {
      setUpdatingId(meetingId);
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        // Update local state
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meetingId ? { ...m, status: action } : m
          )
        );
        showToast(
          action === 'ACCEPTED' ? '✨ Meeting Confirmed!' : '❌ Meeting Rejected',
          'success'
        );
      } else {
        const data = await response.json();
        showToast(data.error || `Failed to ${action.toLowerCase()} meeting`, 'error');
      }
    } catch (err) {
      console.error('Error updating meeting:', err);
      showToast('Failed to update meeting', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Meetings</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Meetings</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No upcoming meetings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Upcoming Meetings</h2>
        <Link
          href="/dashboard/meetings"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                meeting.status === 'ACCEPTED'
                  ? 'bg-green-100 text-green-800'
                  : meeting.status === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {meeting.status}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>
                  {new Date(meeting.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>
                  {new Date(meeting.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(meeting.endTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {meeting.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{meeting.location}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 mb-3">
              {meeting.entrepreneur.firstName} {meeting.entrepreneur.lastName}
              {' •  '}
              {meeting.investor.firstName} {meeting.investor.lastName}
            </div>

            {/* Action Buttons for PENDING Meetings */}
            {meeting.status === 'PENDING' && (
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleMeetingAction(meeting.id, 'ACCEPTED')}
                  disabled={updatingId === meeting.id}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => handleMeetingAction(meeting.id, 'REJECTED')}
                  disabled={updatingId === meeting.id}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}

            {/* Accepted/Rejected Status Display */}
            {(meeting.status === 'ACCEPTED' || meeting.status === 'REJECTED') && (
              <div className="pt-3 border-t border-gray-200">
                {meeting.status === 'ACCEPTED' ? (
                  <Link
                    href={'/meeting/' + meeting.id}
                    className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors text-center"
                  >
                    📹 Join Video Call
                  </Link>
                ) : (
                  <div className="text-center text-sm font-medium">
                    <span className="text-red-600">✗ Meeting Rejected</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
