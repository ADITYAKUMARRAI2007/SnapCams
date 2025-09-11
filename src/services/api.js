// API Service for connecting frontend to backend
// Resolve API/Socket base URLs from env or runtime. Default to localhost only in dev.
const ENV_API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || null;
const ENV_SOCKET_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_BASE_URL) || null;
// Optional runtime override via a global injected before app bootstrap
// eslint-disable-next-line no-undef
const RUNTIME_API_BASE = (typeof window !== 'undefined' && window.__API_BASE_URL__) || null;
// eslint-disable-next-line no-undef
const RUNTIME_SOCKET_BASE = (typeof window !== 'undefined' && window.__SOCKET_BASE_URL__) || null;

const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname);

const RESOLVED_API_BASE = RUNTIME_API_BASE || ENV_API_BASE || (isLocalhost ? 'http://localhost:5001/api' : `${window.location.origin.replace(/\/$/, '')}/api`);
const RESOLVED_SOCKET_BASE = RUNTIME_SOCKET_BASE || ENV_SOCKET_BASE || (isLocalhost ? 'http://localhost:5001' : window.location.origin);

export const SOCKET_BASE_URL = RESOLVED_SOCKET_BASE;

class ApiService {
  constructor() {
    this.baseURL = RESOLVED_API_BASE;
    this.accessToken = localStorage.getItem('accessToken') || 'dev-token-aditya-kumar';
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Set authentication token
  setToken(token) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  // Get headers with authentication
  getHeaders() {
    return {
      'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : '',
      'Content-Type': 'application/json'
    };
  }

  // Get headers for file uploads
  getUploadHeaders() {
    return {
      'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : ''
    };
  }

  // Generate AI caption for image
  async generateCaption(imageFile, context = {}) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('location', context.location || 'Current Location');
      formData.append('mood', context.mood || 'Happy');
      formData.append('timeOfDay', context.timeOfDay || 'Evening');

      const response = await fetch(`${this.baseURL}/posts/generate-caption`, {
        method: 'POST',
        body: formData,
        headers: this.getUploadHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating caption:', error);
      throw error;
    }
  }

  // Create new post
  async createPost(postData) {
    try {
      const response = await fetch(`${this.baseURL}/posts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Create new story
  async createStory(storyData) {
    try {
      const response = await fetch(`${this.baseURL}/stories`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(storyData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get user's posts
  async getUserPosts(userId) {
    try {
      const response = await fetch(`${this.baseURL}/posts/user/${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }

  // Get user's stories
  async getUserStories(userId) {
    try {
      const response = await fetch(`${this.baseURL}/stories/user/${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  }

  // Like a post
  async likePost(postId) {
    try {
      const response = await fetch(`${this.baseURL}/posts/${postId}/like`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  // Comment on a post
  async commentOnPost(postId, comment) {
    try {
      const response = await fetch(`${this.baseURL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ comment })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error commenting on post:', error);
      throw error;
    }
  }

  // Get friends list
  async getFriends() {
    try {
      const response = await fetch(`${this.baseURL}/friends`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  // Add friend
  async addFriend(friendData) {
    try {
      const response = await fetch(`${this.baseURL}/friends`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(friendData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  }

  // Remove friend
  async removeFriend(friendId) {
    try {
      const response = await fetch(`${this.baseURL}/friends/${friendId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  // Update user location
  async updateUserLocation(userId, location) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/location`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(location)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query) {
    try {
      const response = await fetch(`${this.baseURL}/search/users?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get notifications
  async getNotifications() {
    try {
      const response = await fetch(`${this.baseURL}/notifications`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // User authentication methods
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data.accessToken) {
        this.setToken(result.data.accessToken);
      }
      
      return result;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data.accessToken) {
        this.setToken(result.data.accessToken);
      }
      
      return result;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Clear token regardless of response
      this.setToken(null);
      localStorage.removeItem('token');
      
      return result;
    } catch (error) {
      console.error('Error logging out:', error);
      // Clear token even on error
      this.setToken(null);
      localStorage.removeItem('token');
      throw error;
    }
  }

  // Get chat conversations
  async getConversations() {
    try {
      const response = await fetch(`${this.baseURL}/chat/conversations`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get chat messages
  async getChatMessages(conversationId) {
    try {
      const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  // Send chat message
  async sendChatMessage(conversationId, message) {
    try {
      const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        this.accessToken = result.data.accessToken;
        this.refreshToken = result.data.refreshToken;
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
      }
      
      return result;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        this.accessToken = result.data.accessToken;
        this.refreshToken = result.data.refreshToken;
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
      }
      
      return result;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      return response.json();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Feed methods
  async getFeed(page = 1, limit = 20) {
    try {
      const response = await fetch(`${this.baseURL}/posts?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error loading feed data:', error);
      throw error;
    }
  }

  async generateCaption(imageFile, context) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (context?.location) formData.append('location', context.location);
      if (context?.mood) formData.append('mood', context.mood);
      if (context?.timeOfDay) formData.append('timeOfDay', context.timeOfDay);

      const response = await fetch(`${this.baseURL}/posts/generate-caption`, {
        method: 'POST',
        headers: {
          'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : ''
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating caption:', error);
      throw error;
    }
  }

  async createPost(postData, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', postData.caption);
      formData.append('hashtags', JSON.stringify(postData.hashtags));
      if (postData.location) {
        formData.append('location', JSON.stringify(postData.location));
      }

      const response = await fetch(`${this.baseURL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : ''
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async likePost(postId) {
    try {
      const response = await fetch(`${this.baseURL}/posts/${postId}/like`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async savePost(postId) {
    try {
      const response = await fetch(`${this.baseURL}/posts/${postId}/save`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  async sharePost(postId) {
    try {
      const response = await fetch(`${this.baseURL}/posts/${postId}/share`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }

  // Story methods
  async getStories() {
    try {
      const response = await fetch(`${this.baseURL}/stories`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error loading stories:', error);
      throw error;
    }
  }

  async createStory(storyData, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (storyData.caption) formData.append('caption', storyData.caption);
      if (storyData.music) formData.append('music', JSON.stringify(storyData.music));
      if (storyData.location) formData.append('location', JSON.stringify(storyData.location));

      const response = await fetch(`${this.baseURL}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : ''
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async viewStory(storyId) {
    try {
      const response = await fetch(`${this.baseURL}/stories/${storyId}/view`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error viewing story:', error);
      throw error;
    }
  }

  // Utility methods
  isAuthenticated() {
    return !!this.accessToken;
  }

  getAccessToken() {
    return this.accessToken;
  }
}

// Create singleton instance
const apiService = new ApiService();

export { apiService };
export default apiService;
