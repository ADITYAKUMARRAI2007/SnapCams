import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Plus, Smile, Camera, Mic, Heart, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { socketService } from '../services/socket';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice';
  isLiked?: boolean;
}

interface IndividualChatViewProps {
  user: User;
  onBack: () => void;
  onViewProfile: (userId: string) => void;
}

export function IndividualChatView({ user, onBack, onViewProfile }: IndividualChatViewProps) {
  const [messageText, setMessageText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([] as Message[]);
  const messagesEndRef = useRef(null) ;

  // Load real messages when component mounts
  useEffect(() => {
    // ensure socket is connected
    socketService.connect();

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const response = await fetch(`http://snapcap-backend.onrender.com/api/friends/${(user.id || '').toString()}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const messagesData = await response.json();
          console.log('✅ Loaded messages:', messagesData);
          
          // Transform messages to match frontend format
          const transformedMessages = messagesData.map((msg: any) => ({
            id: msg._id,
            content: msg.content,
            senderId: msg.sender,
            timestamp: new Date(msg.createdAt).getTime(),
            type: msg.type || 'text'
          }));
          setMessages(transformedMessages);
        } else {
          console.error('Failed to load messages:', response.status);
          // Use empty array instead of sample messages for now
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Subscribe to realtime messages for this user
    const offNewMessage = socketService.onNewMessage((data: any) => {
      if (data?.sender === user.id || data?.receiver === user.id) {
        setMessages(prev => [...prev, {
          id: data._id || `rt-${Date.now()}`,
          content: data.content,
          senderId: data.sender,
          timestamp: new Date(data.createdAt || Date.now()).getTime(),
          type: data.type || 'text'
        }]);
      }
    });

    return () => {
      offNewMessage?.();
    };
  }, [user.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    return null;
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    
    const messageContent = messageText.trim();
    setMessageText('');

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: getCurrentUserId() || 'me',
      timestamp: Date.now(),
      type: 'text'
    };
    
    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send message to backend using the correct endpoint
      const response = await fetch(`http://snapcap-backend.onrender.com/api/friends/${(user.id || '').toString()}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: messageContent,
          type: 'text'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Message sent successfully:', result);
        
        // Replace optimistic message with real message
    setMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...result, id: result._id, senderId: result.sender, timestamp: new Date(result.createdAt).getTime() }
            : msg
        ));

        // Emit socket notification for listeners
        try {
          socketService.emitMessageSent(result.conversation || '', user.id, result._id);
        } catch (e) {}
      } else {
        console.error('❌ Failed to send message:', response.status);
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        setMessageText(messageContent); // Restore message text
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setMessageText(messageContent); // Restore message text
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
            <button
            onClick={() => onViewProfile(user.id)}
              className="flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors"
          >
            <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden">
              <ImageWithFallback
                src={user.avatar}
                alt={user.displayName}
                    className="w-full h-full object-cover"
              />
                </div>
              {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black" />
              )}
            </div>
            
              <div className="text-left">
              <h3 className="text-white font-semibold">{user.displayName}</h3>
              <p className="text-white/60 text-sm">
                  {user.isOnline ? 'Active now' : user.lastSeen || 'Last seen recently'}
              </p>
            </div>
            </button>
        </div>
        
          <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Info className="w-5 h-5" />
          </Button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-white/60">Loading messages...</div>
              </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No messages yet</h3>
            <p className="text-white/60">Start the conversation with {user.displayName}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
                  key={message.id}
              className={`flex ${
                message.senderId === getCurrentUserId() ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === getCurrentUserId()
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">{formatTime(message.timestamp)}</p>
                    </div>
                  </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            className="absolute bottom-20 left-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="grid grid-cols-4 gap-4">
              <button className="flex flex-col items-center space-y-2 p-3 hover:bg-white/10 rounded-xl transition-colors">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs">Camera</span>
              </button>
              
              <button className="flex flex-col items-center space-y-2 p-3 hover:bg-white/10 rounded-xl transition-colors">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs">Voice</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input */}
      <div className="bg-black/90 backdrop-blur-md border-t border-white/10 p-4">
        <div className="flex items-end space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 flex-shrink-0"
            onClick={() => setShowAttachments(!showAttachments)}
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 bg-white/10 rounded-2xl flex items-end">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${user.displayName}...`}
              className="flex-1 bg-transparent text-white placeholder-white/60 p-3 resize-none max-h-32 min-h-[44px] outline-none"
              rows={1}
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 m-1 flex-shrink-0"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          
          <Button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 flex-shrink-0"
            disabled={!messageText.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}