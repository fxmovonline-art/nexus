'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ChatList from '@/components/messages/ChatList';
import ChatWindow from '@/components/messages/ChatWindow';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
  senderName: string;
}

const chatsData: { [key: string]: { chat: Chat; messages: Message[] } } = {
  '1': {
    chat: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '👩‍💼',
      lastMessage: 'That sounds great! When can we call?',
      timestamp: '2:30 PM',
      unread: 1,
    },
    messages: [
      {
        id: '1',
        sender: 'other',
        text: 'Hi! I got your pitch deck. Really impressed with the team.',
        timestamp: '1:15 PM',
        senderName: 'Sarah Johnson',
      },
      {
        id: '2',
        sender: 'user',
        text: 'Thanks! We would love to discuss further.',
        timestamp: '1:30 PM',
        senderName: 'You',
      },
      {
        id: '3',
        sender: 'other',
        text: 'That sounds great! When can we call?',
        timestamp: '2:30 PM',
        senderName: 'Sarah Johnson',
      },
    ],
  },
  '2': {
    chat: {
      id: '2',
      name: 'Michael Rodriguez',
      avatar: '👨‍💼',
      lastMessage: 'Looking forward to the Demo Day',
      timestamp: '1:45 PM',
      unread: 0,
    },
    messages: [
      {
        id: '1',
        sender: 'other',
        text: 'Your startup is on my watchlist.',
        timestamp: '10:00 AM',
        senderName: 'Michael Rodriguez',
      },
      {
        id: '2',
        sender: 'other',
        text: 'Looking forward to the Demo Day',
        timestamp: '1:45 PM',
        senderName: 'Michael Rodriguez',
      },
    ],
  },
  '3': {
    chat: {
      id: '3',
      name: 'Jennifer Lee',
      avatar: '👩‍💼',
      lastMessage: 'Can you send over the deck?',
      timestamp: '11:20 AM',
      unread: 2,
    },
    messages: [
      {
        id: '1',
        sender: 'other',
        text: 'Hi there! Heard great things about your startup.',
        timestamp: '10:30 AM',
        senderName: 'Jennifer Lee',
      },
      {
        id: '2',
        sender: 'user',
        text: 'Thanks! Happy to share more details.',
        timestamp: '10:45 AM',
        senderName: 'You',
      },
      {
        id: '3',
        sender: 'other',
        text: 'Can you send over the deck?',
        timestamp: '11:20 AM',
        senderName: 'Jennifer Lee',
      },
    ],
  },
};

const allChats: Chat[] = Object.values(chatsData).map((item) => item.chat);

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState<string>('1');
  const [chats, setChats] = useState(chatsData);

  const currentChatData = chats[activeChat];

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      senderName: 'You',
    };

    setChats((prevChats) => ({
      ...prevChats,
      [activeChat]: {
        ...prevChats[activeChat],
        messages: [...prevChats[activeChat].messages, newMessage],
        chat: {
          ...prevChats[activeChat].chat,
          lastMessage: text,
          timestamp: 'now',
          unread: 0,
        },
      },
    }));
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex gap-6 bg-gray-50 -mx-8 -mb-8">
        {/* Chat List - Hidden on mobile */}
        <div className="hidden lg:block">
          <ChatList
            chats={allChats}
            activeChat={activeChat}
            onSelectChat={setActiveChat}
          />
        </div>

        {/* Chat Window */}
        {currentChatData && (
          <ChatWindow
            chatName={currentChatData.chat.name}
            messages={currentChatData.messages}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
