import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from './api';

class SocketService {
  private socket: Socket | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.loadToken();
  }

  private loadToken() {
    this.accessToken = localStorage.getItem('accessToken');
  }

  // Connect to Socket.IO server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.loadToken();

      if (!this.accessToken) {
        console.log('⚠️ No access token found, skipping Socket.IO connection');
        resolve(); // Don't reject, just skip connection
        return;
      }

      this.socket = io(SOCKET_BASE_URL, {
        auth: {
          token: this.accessToken,
        },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to Socket.IO server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
        // Don't reject, just log the error and resolve
        console.log('⚠️ Socket.IO connection failed, continuing without real-time features');
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from Socket.IO server:', reason);
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  // Disconnect from Socket.IO server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Setup event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    // User status events
    this.socket.on('user_online', (data) => {
      console.log('User came online:', data);
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('userOnline', { detail: data }));
    });

    this.socket.on('user_offline', (data) => {
      console.log('User went offline:', data);
      window.dispatchEvent(new CustomEvent('userOffline', { detail: data }));
    });

    // Chat events
    this.socket.on('new_message', (data) => {
      console.log('New message received:', data);
      window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
    });

    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data);
      window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
    });

    // Notification events
    this.socket.on('new_notification', (data) => {
      console.log('New notification:', data);
      window.dispatchEvent(new CustomEvent('newNotification', { detail: data }));
    });
  }

  // Chat methods
  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  startTyping(conversationId: string, receiverId: string) {
    if (this.socket) {
      this.socket.emit('typing_start', { conversationId, receiverId });
    }
  }

  stopTyping(conversationId: string, receiverId: string) {
    if (this.socket) {
      this.socket.emit('typing_stop', { conversationId, receiverId });
    }
  }

  // Post interaction events
  emitPostLiked(postId: string, postAuthorId: string) {
    if (this.socket) {
      this.socket.emit('post_liked', { postId, postAuthorId });
    }
  }

  emitPostCommented(postId: string, postAuthorId: string, commentId: string) {
    if (this.socket) {
      this.socket.emit('post_commented', { postId, postAuthorId, commentId });
    }
  }

  emitUserFollowed(followedUserId: string) {
    if (this.socket) {
      this.socket.emit('user_followed', { followedUserId });
    }
  }

  emitStoryViewed(storyId: string, storyAuthorId: string) {
    if (this.socket) {
      this.socket.emit('story_viewed', { storyId, storyAuthorId });
    }
  }

  emitDuetCreated(originalPostId: string, originalPostAuthorId: string, duetId: string) {
    if (this.socket) {
      this.socket.emit('duet_created', { originalPostId, originalPostAuthorId, duetId });
    }
  }

  emitMessageSent(conversationId: string, receiverId: string, messageId: string) {
    if (this.socket) {
      this.socket.emit('message_sent', { conversationId, receiverId, messageId });
    }
  }

  emitUserMentioned(mentionedUserId: string, postId?: string, commentId?: string) {
    if (this.socket) {
      this.socket.emit('user_mentioned', { mentionedUserId, postId, commentId });
    }
  }

  // Event listener helpers for components
  onUserOnline(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('userOnline', handler as EventListener);
    return () => window.removeEventListener('userOnline', handler as EventListener);
  }

  onUserOffline(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('userOffline', handler as EventListener);
    return () => window.removeEventListener('userOffline', handler as EventListener);
  }

  onNewMessage(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('newMessage', handler as EventListener);
    return () => window.removeEventListener('newMessage', handler as EventListener);
  }

  onUserTyping(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('userTyping', handler as EventListener);
    return () => window.removeEventListener('userTyping', handler as EventListener);
  }

  onNewNotification(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('newNotification', handler as EventListener);
    return () => window.removeEventListener('newNotification', handler as EventListener);
  }
}

// Create and export socket service instance
export const socketService = new SocketService();


