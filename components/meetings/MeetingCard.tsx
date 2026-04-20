import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface MeetingCardProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  attendees: Array<{ name: string; avatar: string }>;
  status: 'upcoming' | 'past';
}

export default function MeetingCard({
  id,
  title,
  startTime,
  endTime,
  date,
  location,
  attendees,
  status,
}: MeetingCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'upcoming'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {status === 'upcoming' ? 'Upcoming' : 'Past'}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>{location}</span>
      </div>

      {/* Attendees */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Attendees</span>
        </div>
        <div className="flex items-center gap-2">
          {attendees.slice(0, 3).map((attendee, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 border border-blue-300"
              title={attendee.name}
            >
              {attendee.avatar}
            </div>
          ))}
          {attendees.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              +{attendees.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        {status === 'upcoming' && (
          <>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
              Join Meeting
            </button>
            <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
              Reschedule
            </button>
          </>
        )}
        {status === 'past' && (
          <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            View Recording
          </button>
        )}
      </div>
    </div>
  );
}
