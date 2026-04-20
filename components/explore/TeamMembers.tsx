interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface TeamMembersProps {
  members: TeamMember[];
}

export default function TeamMembers({ members }: TeamMembersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Team Members</h2>
      
      <div className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">
              {member.avatar}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
        Request Meeting
      </button>
    </div>
  );
}
