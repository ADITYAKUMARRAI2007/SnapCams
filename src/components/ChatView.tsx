import React, { useState } from 'react';
import { Search, MessageCircle, Phone, Video, MoreVertical, ArrowLeft, Send, Camera, Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LiquidEtherBackground } from './LiquidEtherBackground';

interface Chat {
  id: string;
  user: {
    username: string;
    displayName: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: number;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
  type: 'text' | 'image' | 'video';
  imageUrl?: string;
}

interface ChatViewProps {
  onBack: () => void;
  onOpenIndividualChat?: (userId: string) => void;
}

export function ChatView({ onBack, onOpenIndividualChat }: ChatViewProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  const [chats] = useState<Chat[]>([
    {
      id: '1',
      user: {
        username: 'alexandra_dreams',
        displayName: 'Alexandra ✨',
        avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        isOnline: true,
      },
      lastMessage: {
        content: 'Your coffee shot was amazing! ☕️✨',
        timestamp: Date.now() - 300000,
        isRead: false,
        senderId: '1'
      },
      unreadCount: 2
    },
    {
      id: '2',
      user: {
        username: 'cosmic_wanderer',
        displayName: 'Cosmic Soul 🌙',
        avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        isOnline: false,
      },
      lastMessage: {
        content: 'That sunset though! 🌅',
        timestamp: Date.now() - 3600000,
        isRead: true,
        senderId: 'me'
      },
      unreadCount: 0
    },
    {
      id: '3',
      user: {
        username: 'urban_explorer',
        displayName: 'Street Artist 🎨',
        avatar: 'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9maWxlfGVufDF8fHx8MTc1Njc4MTIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        isOnline: true,
      },
      lastMessage: {
        content: 'Found this incredible mural! Check my latest post 🎨',
        timestamp: Date.now() - 7200000,
        isRead: true,
        senderId: '3'
      },
      unreadCount: 0
    }
  ]);

  const [messages] = useState<{ [chatId: string]: Message[] }>({
    '1': [
      {
        id: '1',
        content: 'Hey! Just saw your coffee photo on SnapCap 📸',
        senderId: '1',
        timestamp: Date.now() - 600000,
        type: 'text'
      },
      {
        id: '2',
        content: 'Thanks! I was experimenting with morning light ☀️',
        senderId: 'me',
        timestamp: Date.now() - 450000,
        type: 'text'
      },
      {
        id: '3',
        content: 'Your coffee shot was amazing! ☕️✨',
        senderId: '1',
        timestamp: Date.now() - 300000,
        type: 'text'
      },
      {
        id: '4',
        content: 'We should do a photo walk together sometime!',
        senderId: '1',
        timestamp: Date.now() - 120000,
        type: 'text'
      }
    ]
  });

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const filteredChats = chats.filter(chat => 
    chat.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;
    
    // Logic to send message would go here
    console.log('Sending message:', messageText, 'to chat:', selectedChat);
    setMessageText('');
  };

  if (selectedChat) {
    const chat = chats.find(c => c.id === selectedChat);
    const chatMessages = messages[selectedChat] || [];
    
    return (
      <div className="w-full h-full bg-black">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedChat(null)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="relative">
              <ImageWithFallback
                src={chat?.user.avatar || ''}
                alt={chat?.user.displayName || ''}
                className="w-10 h-10 rounded-full object-cover"
              />
              {chat?.user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
              )}
            </div>
            
            <div>
              <h3 className="text-white font-semibold">{chat?.user.displayName}</h3>
              <p className="text-white/60 text-sm">
                {chat?.user.isOnline ? 'Active now' : 'Active 2h ago'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                message.senderId === 'me'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white'
              }`}>
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === 'me' ? 'text-blue-100' : 'text-white/60'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Camera className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Message..."
                className="bg-white/10 border-white/20 text-white placeholder-white/60 pr-12"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!messageText.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden" style={{
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-y pinch-zoom'
    }}>
      <LiquidEtherBackground variant="chat" />
      
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-xl font-semibold">Messages</h1>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <motion.button
            key={chat.id}
            onClick={() => {
              if (onOpenIndividualChat) {
                onOpenIndividualChat(chat.user.username);
              } else {
                setSelectedChat(chat.id);
              }
            }}
            className="w-full p-4 flex items-center space-x-3 hover:bg-white/5 transition-colors border-b border-white/5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <ImageWithFallback
                src={chat.user.avatar}
                alt={chat.user.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
              {chat.user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black" />
              )}
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{chat.user.displayName}</h3>
                <span className="text-white/60 text-sm">{formatTime(chat.lastMessage.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${
                  chat.lastMessage.isRead ? 'text-white/60' : 'text-white font-medium'
                }`}>
                  {chat.lastMessage.content}
                </p>
                {chat.unreadCount > 0 && (
                  <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}