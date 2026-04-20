interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
  senderName: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUserMessage = message.sender === 'user';

  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUserMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p
          className={`text-xs mt-1 ${
            isUserMessage ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
