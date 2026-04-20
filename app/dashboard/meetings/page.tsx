'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Building2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  meetingLink?: string;
  investor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startup: {
    id: string;
    name: string;
  };
}

interface ToastNotification {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch meetings on mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/meetings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to fetch meetings');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    const toast: ToastNotification = { id, type, message };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleUpdateMeetingStatus = async (meetingId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      setUpdatingId(meetingId);
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Not authenticated', 'error');
        return;
      }

      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setMeetings((prev) =>
          prev.map((m) => (m.id === meetingId ? { ...m, status: newStatus } : m))
        );
        
        const statusText = newStatus === 'ACCEPTED' ? '✨ Meeting Confirmed!' : '❌ Meeting Rejected';
        showToast(statusText, 'success');
      } else {
        const data = await response.json();
        showToast(data.error || `Failed to ${newStatus.toLowerCase()} meeting`, 'error');
      }
    } catch (err) {
      console.error('Error updating meeting:', err);
      showToast('Failed to update meeting', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter meetings
  const pendingMeetings = meetings.filter((m) => m.status === 'PENDING');
  const acceptedMeetings = meetings.filter((m) => m.status === 'ACCEPTED');

  // Get calendar days for the month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDayMeetings = (day: number) => {
    return acceptedMeetings.filter((m) => {
      const meetingDate = new Date(m.startTime);
      return (
        meetingDate.getFullYear() === currentMonth.getFullYear() &&
        meetingDate.getMonth() === currentMonth.getMonth() &&
        meetingDate.getDate() === day
      );
    });
  };

  // Calendar rendering
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Meetings</h1>
          <p className="text-gray-600">Manage your investor meeting requests and schedule</p>
        </div>

        {/* Toasts */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
                toast.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={toast.type === 'success' ? 'text-green-900' : 'text-red-900'}>
                {toast.message}
              </span>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading meetings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-900 font-medium">{error}</p>
            <button
              onClick={fetchMeetings}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Pending & Accepted Requests */}
            <div className="lg:col-span-2 space-y-8">
              {/* Pending Meetings Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
                  {pendingMeetings.length > 0 && (
                    <span className="ml-auto bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {pendingMeetings.length}
                    </span>
                  )}
                </div>

                {pendingMeetings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No pending meeting requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {/* Meeting Info */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{meeting.startup.name}</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-4 mb-4 py-3 bg-gray-50 rounded px-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-600">Investor</p>
                                <p className="font-medium text-gray-900">
                                  {meeting.investor.firstName} {meeting.investor.lastName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-600">Startup</p>
                                <p className="font-medium text-gray-900">{meeting.startup.name}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs text-gray-600">Date</p>
                                <p className="font-medium text-gray-900">{formatDate(meeting.startTime)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs text-gray-600">Time</p>
                                <p className="font-medium text-gray-900">
                                  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {meeting.description && (
                            <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <p className="text-sm text-blue-900">
                                <span className="font-medium">Message: </span>
                                {meeting.description}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleUpdateMeetingStatus(meeting.id, 'ACCEPTED')}
                            disabled={updatingId === meeting.id}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateMeetingStatus(meeting.id, 'REJECTED')}
                            disabled={updatingId === meeting.id}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accepted Meetings List */}
              {acceptedMeetings.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Confirmed Meetings</h2>
                    <span className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {acceptedMeetings.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {acceptedMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{meeting.title}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}
                          </p>
                        </div>
                        {meeting.meetingLink && (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Calendar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
                <h2 className="text-xl font-bold text-gray-900 mb-6">📆 Calendar</h2>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ←
                  </button>
                  <span className="text-lg font-semibold text-gray-900">{monthName}</span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    →
                  </button>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const dayMeetings = day ? getDayMeetings(day) : [];
                    const isToday =
                      day &&
                      new Date().toDateString() ===
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

                    return (
                      <div
                        key={index}
                        className={`aspect-square p-1 text-xs rounded-lg flex flex-col items-center justify-center transition-colors ${
                          !day
                            ? ''
                            : isToday
                              ? 'bg-blue-100 border border-blue-400'
                              : dayMeetings.length > 0
                                ? 'bg-green-100 border border-green-400'
                                : 'hover:bg-gray-50'
                        }`}
                      >
                        {day && (
                          <>
                            <span className={`font-semibold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                              {day}
                            </span>
                            {dayMeetings.length > 0 && (
                              <span className="text-green-600 font-bold text-xs">
                                {dayMeetings.length === 1 ? '●' : `●●`}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Meeting Count on Selected Month */}
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-sm text-blue-900">
                    <span className="font-bold">{acceptedMeetings.length}</span> confirmed meetings this month
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
