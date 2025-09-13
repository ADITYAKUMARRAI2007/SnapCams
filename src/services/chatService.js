// Chat Service for Frontend Chat Functionality
import apiService from './api';

class ChatService {
  constructor() {
    this.currentUserId = null; // Will be set from auth
    this.conversations = new Map();
    this.messageListeners = new Set();
  }

  // Set current user ID from authentication
  setCurrentUserId(userId) {
    this.currentUserId = userId;
  }

  // Get current user ID
  getCurrentUserId() {
    if (!this.currentUserId) {
      // Try to get from localStorage as fallback
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.currentUserId = user.id;
      }
    }
    return this.currentUserId;
  }

  // Start a chat with a friend
  async startChat(friendId) {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }
      
      const response = await apiService.request(`/friends/${friendId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ currentUserId })
      });
      
      console.log('💬 Chat started:', response);
      return response;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  }

  // Get messages with a friend
  async getMessages(friendId, page = 1, limit = 50) {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }
      
      const messages = await apiService.request(`/friends/${friendId}/messages?currentUserId=${currentUserId}&page=${page}&limit=${limit}`);
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Send a message to a friend
  async sendMessage(friendId, content, type = 'text') {
    try {
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }
      
      const message = await apiService.request(`/friends/${friendId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          currentUserId,
          content,
          type
        })
      });
      
      // Notify listeners
      this.notifyMessageListeners(friendId, message);
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Add message listener
  addMessageListener(callback) {
    this.messageListeners.add(callback);
    
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  // Notify message listeners
  notifyMessageListeners(friendId, message) {
    this.messageListeners.forEach(callback => {
      try {
        callback(friendId, message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  // Get conversation history
  async getConversationHistory(friendId) {
    try {
      const messages = await this.getMessages(friendId);
      this.conversations.set(friendId, messages);
      return messages;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Mark messages as read
  async markAsRead(friendId, messageIds) {
    try {
      // In a real app, this would call an API endpoint
      console.log('📖 Marking messages as read:', messageIds);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // Get unread message count
  async getUnreadCount(friendId) {
    try {
      const messages = await this.getMessages(friendId);
      const unreadCount = messages.filter(msg => 
        msg.receiver === this.currentUserId && !msg.isRead
      ).length;
      
      return unreadCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get all conversations
  async getAllConversations() {
    try {
      // In a real app, this would fetch from a conversations endpoint
      const friends = await apiService.getFriends();
      const conversations = [];
      
      for (const friend of friends) {
        const messages = await this.getMessages(friend.id, 1, 1);
        if (messages.length > 0) {
          conversations.push({
            friendId: friend.id,
            friend: friend,
            lastMessage: messages[0],
            unreadCount: await this.getUnreadCount(friend.id)
          });
        }
      }
      
      return conversations.sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
