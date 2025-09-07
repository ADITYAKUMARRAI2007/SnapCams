import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Camera, Smile, Plus, Image, Heart, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
  type: 'text' | 'image' | 'video';
  imageUrl?: string;
  isLiked?: boolean;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  bio?: string;
  mutualFriends?: number;
  lastSeen?: string;
}

interface IndividualChatViewProps {
  user: User;
  onBack: () => void;
  onViewProfile: (userId: string) => void;
}

export function IndividualChatView({ user, onBack, onViewProfile }: IndividualChatViewProps) {
  const [messageText, setMessageText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample messages for the chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! Just saw your latest SnapCap post 📸',
      senderId: user.id,
      timestamp: Date.now() - 3600000,
      type: 'text'
    },
    {
      id: '2',
      content: 'Thanks! I was experimenting with the lighting ✨',
      senderId: 'me',
      timestamp: Date.now() - 3300000,
      type: 'text'
    },
    {
      id: '3',
      content: 'Your photography skills are incredible! The composition is perfect 🎯',
      senderId: user.id,
      timestamp: Date.now() - 3000000,
      type: 'text',
      isLiked: true
    },
    {
      id: '4',
      content: 'We should do a photo walk together sometime! I know some amazing spots around the city 🌆',
      senderId: user.id,
      timestamp: Date.now() - 2700000,
      type: 'text'
    },
    {
      id: '5',
      content: 'That sounds amazing! I would love to explore new places 🗺️',
      senderId: 'me',
      timestamp: Date.now() - 2400000,
      type: 'text'
    },
    {
      id: '6',
      content: 'Perfect! How about this weekend? The weather looks great for outdoor photography ☀️',
      senderId: user.id,
      timestamp: Date.now() - 600000,
      type: 'text'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      senderId: 'me',
      timestamp: Date.now(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
  };

  const likeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isLiked: !msg.isLiked } : msg
    ));
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [date: string]: Message[] }, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="w-full h-full bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => onViewProfile(user.id)}
          >
            <div className="relative">
              <ImageWithFallback
                src={user.avatar}
                alt={user.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
              )}
            </div>
            
            <div>
              <h3 className="text-white font-semibold">{user.displayName}</h3>
              <p className="text-white/60 text-sm">
                {user.isOnline ? 'Active now' : user.lastSeen || 'Active 2h ago'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            {/* Date separator */}
            <div className="flex items-center justify-center">
              <div className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>
            
            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isFromMe = message.senderId === 'me';
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId;
              
              return (
                <motion.div
                  key={message.id}
                  className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`flex ${isFromMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs`}>
                    {/* Avatar (only show for first message in group) */}
                    {!isFromMe && isFirstInGroup && (
                      <ImageWithFallback
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    {!isFromMe && !isFirstInGroup && (
                      <div className="w-6" />
                    )}
                    
                    <div className={`group relative ${isFromMe ? 'ml-2' : 'mr-2'}`}>
                      {/* Message bubble */}
                      <div className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                        isFromMe
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white/10 text-white rounded-bl-md'
                      } ${!isFirstInGroup ? (isFromMe ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        {/* Timestamp */}
                        <p className={`text-xs mt-1 ${
                          isFromMe ? 'text-blue-100' : 'text-white/50'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      
                      {/* Like button */}
                      <button
                        onClick={() => likeMessage(message.id)}
                        className={`absolute -bottom-1 ${isFromMe ? '-left-6' : '-right-6'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 rounded-full p-1`}
                      >
                        <Heart 
                          className={`w-3 h-3 ${message.isLiked ? 'text-red-500 fill-red-500' : 'text-white/60'}`} 
                        />
                      </button>
                      
                      {/* Like indicator */}
                      {message.isLiked && (
                        <div className={`absolute -bottom-2 ${isFromMe ? 'left-0' : 'right-0'} bg-red-500 rounded-full p-1`}>
                          <Heart className="w-2 h-2 text-white fill-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            className="px-4 pb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center space-x-4 bg-white/10 rounded-2xl p-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
              >
                <Image className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Message Input */}
      <div className="p-4 border-t border-white/10 bg-black/90 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10"
            onClick={() => setShowAttachments(!showAttachments)}
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Message..."
              className="bg-white/10 border-white/20 text-white placeholder-white/60 pr-12 rounded-2xl"
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
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-full"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}