// API Service for Backend Communication
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5001/api';
    this.timeout = 10000; // 10 seconds
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Friends API
  async getFriends() {
    return this.request('/friends');
  }

  async getFriendPosts(friendId) {
    return this.request(`/friends/${friendId}/posts`);
  }

  async getFriendLocation(friendId) {
    return this.request(`/friends/${friendId}/location`);
  }

  async addFriend(friendData) {
    return this.request('/friends', {
      method: 'POST',
      body: JSON.stringify(friendData)
    });
  }

  async removeFriend(friendId) {
    return this.request(`/friends/${friendId}`, {
      method: 'DELETE'
    });
  }

  async addFriendPost(friendId, postData) {
    return this.request(`/friends/${friendId}/posts`, {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async updateFriendLocation(friendId, location) {
    return this.request(`/friends/${friendId}/location`, {
      method: 'PUT',
      body: JSON.stringify(location)
    });
  }

  // Users API
  async getUserLocation(userId) {
    return this.request(`/users/${userId}/location`);
  }

  async updateUserLocation(userId, location) {
    return this.request(`/users/${userId}/location`, {
      method: 'PUT',
      body: JSON.stringify(location)
    });
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Posts API
  async getPosts() {
    return this.request('/posts');
  }

  async createPost(postData) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async generateCaption(imageUrl) {
    return this.request('/posts/generate-caption', {
      method: 'POST',
      body: JSON.stringify({ imageUrl })
    });
  }

  // Health check
  async healthCheck() {
    const url = `${this.baseURL.replace('/api', '')}/health`;
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: this.timeout
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  // Authentication API
  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid email or password');
    }
  }

  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Chat API
  async startChat(friendId) {
    return this.request(`/friends/${friendId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ currentUserId: 'current_user' })
    });
  }

  async getMessages(friendId, page = 1, limit = 50) {
    return this.request(`/friends/${friendId}/messages?currentUserId=current_user&page=${page}&limit=${limit}`);
  }

  async sendMessage(friendId, content, type = 'text') {
    return this.request(`/friends/${friendId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        currentUserId: 'current_user',
        content,
        type
      })
    });
  }

  // Test connection
  async testConnection() {
    try {
      const health = await this.healthCheck();
      return { success: true, data: health };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
