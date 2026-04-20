'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MeetingCard from '@/components/meetings/MeetingCard';
import { Calendar, Users } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  attendees: Array<{ name: string; avatar: string }>;
  status: 'upcoming' | 'past';
}

const meetingsData: Meeting[] = [
  {
    id: '1',
    title: 'Investor Pitch Session',
    startTime: '2:00 PM',
    endTime: '2:30 PM',
    date: 'April 16, 2026',
    location: 'Virtual - Zoom',
    attendees: [
      { name: 'Sarah Johnson', avatar: '👩‍💼' },
      { name: 'Michael Rodriguez', avatar: '👨‍💼' },
      { name: 'Jennifer Lee', avatar: '👩‍💼' },
    ],
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Product Demo with Investors',
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    date: 'April 18, 2026',
    location: 'Virtual - Google Meet',
    attendees: [
      { name: 'Alex Thompson', avatar: '👨‍💼' },
      { name: 'Lisa Wong', avatar: '👩‍💼' },
    ],
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Follow-up Discussion',
    startTime: '3:00 PM',
    endTime: '3:30 PM',
    date: 'April 20, 2026',
    location: '123 Innovation St, SF',
    attendees: [
      { name: 'David Chen', avatar: '👨‍💼' },
      { name: 'Emily Davis', avatar: '👩‍💼' },
      { name: 'Mark Wilson', avatar: '👨‍💼' },
      { name: 'Sarah Williams', avatar: '👩‍💼' },
    ],
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'Initial Founders Meeting',
    startTime: '1:00 PM',
    endTime: '1:45 PM',
    date: 'April 10, 2026',
    location: 'Virtual - Zoom',
    attendees: [{ name: 'Jennifer Lee', avatar: '👩‍💼' }],
    status: 'past',
  },
  {
    id: '5',
    title: 'Due Diligence Review',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    date: 'April 8, 2026',
    location: 'Virtual - Teams',
    attendees: [
      { name: 'Michael Rodriguez', avatar: '👨‍💼' },
      { name: 'Lisa Chen', avatar: '👩‍💼' },
    ],
    status: 'past',
  },
];

export default function MeetingsPage() {
  const upcomingMeetings = meetingsData.filter((m) => m.status === 'upcoming');
  const pastMeetings = meetingsData.filter((m) => m.status === 'past');

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-600 mt-1">Manage and track all your meetings</p>
      </div>

      {/* Upcoming Meetings Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Meetings</h2>
          <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {upcomingMeetings.length}
          </span>
        </div>

        {upcomingMeetings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} {...meeting} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No upcoming meetings</p>
          </div>
        )}
      </div>

      {/* Past Meetings Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">Past Meetings</h2>
          <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
            {pastMeetings.length}
          </span>
        </div>

        {pastMeetings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pastMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} {...meeting} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No past meetings</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
