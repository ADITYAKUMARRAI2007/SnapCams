// src/services/apiService.js
// API Service for Backend Communication (robust + minimal changes)

let API_BASE = '';
// Robustly load runtimeConfig which may be CommonJS
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const rc = require('./runtimeConfig');
  // rc might be { API_BASE: '...' } or module.exports.default = { API_BASE: '...' }
  API_BASE = (rc && (rc.API_BASE || (rc.default && rc.default.API_BASE))) || '';
} catch (e) {
  // try ESM import style fallback (shouldn't throw in most bundlers)
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rc2 = require('./runtimeConfig').default;
    API_BASE = (rc2 && rc2.API_BASE) || '';
  } catch (_err) {
    API_BASE = '';
  }
}

// final fallback to relative origin if not resolved
if (!API_BASE && typeof window !== 'undefined') {
  API_BASE = `${window.location.origin.replace(/\/$/, '')}/api`;
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE;
    // if you later want timeout, implement with AbortController per-request
  }

  // helper to build headers and include tokens from either key
  _buildHeaders(customHeaders = {}) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const fetchOptions = {
      method: options.method || 'GET',
      headers: this._buildHeaders(options.headers || {}),
      // don't pass unsupported props like timeout directly to fetch
      body: options.body,
      credentials: options.credentials || 'same-origin'
    };

    // If body is present and is an object but not a FormData, ensure it's a string
    if (fetchOptions.body && typeof fetchOptions.body === 'object' && !(fetchOptions.body instanceof FormData)) {
      fetchOptions.body = JSON.stringify(fetchOptions.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      // Try parsing JSON (handle non-JSON gracefully)
      let payload = null;
      try {
        payload = await response.json();
      } catch (parseErr) {
        // non-JSON response
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        return null;
      }

      if (!response.ok) {
        // If API returned { success: false, message } prefer that message
        const msg = (payload && (payload.message || payload.error)) || `HTTP ${response.status}`;
        const err = new Error(msg);
        err.status = response.status;
        err.payload = payload;
        throw err;
      }

      // If backend uses { success, data } shape, return payload or payload.data
      if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        return payload.data || payload;
      }
      return payload;
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
      body: friendData
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
      body: postData
    });
  }

  async updateFriendLocation(friendId, location) {
    return this.request(`/friends/${friendId}/location`, {
      method: 'PUT',
      body: location
    });
  }

  // Users API
  async getUserLocation(userId) {
    return this.request(`/users/${userId}/location`);
  }

  async updateUserLocation(userId, location) {
    return this.request(`/users/${userId}/location`, {
      method: 'PUT',
      body: location
    });
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData
    });
  }

  // Posts API
  async getPosts() {
    return this.request('/posts');
  }

  async createPost(postData) {
    // assume postData is FormData if includes file; handle accordingly
    const headers = postData instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    return this.request('/posts', {
      method: 'POST',
      headers,
      body: postData
    });
  }

  async generateCaption(imageUrl) {
    return this.request('/posts/generate-caption', {
      method: 'POST',
      body: { imageUrl }
    });
  }

  // Health check
  async healthCheck() {
    const url = `${this.baseURL.replace('/api', '')}/health`;
    try {
      // bypass request() which expects /api shape; use fetch directly
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Health check failed:', err);
      throw err;
    }
  }

  // Authentication API
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });

    // res may be data or payload; backend commonly returns { user, accessToken, refreshToken } under data
    const data = res?.data ? res.data : res;
    // handle nested shapes: data.accessToken or res.accessToken or res.token
    const accessToken = (data && (data.accessToken || data.token)) || (res && (res.accessToken || res.token));

    if (accessToken) {
      // write both keys for compatibility
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: userData
    });

    const data = res?.data ? res.data : res;
    const accessToken = (data && (data.accessToken || data.token)) || (res && (res.accessToken || res.token));

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore server logout error, ensure local cleanup
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const res = await this.request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    });

    const data = res?.data ? res.data : res;
    const accessToken = (data && (data.accessToken || data.token)) || (res && (res.accessToken || res.token));

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  }

  isAuthenticated() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (err) {
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
      body: { currentUserId: 'current_user' }
    });
  }

  async getMessages(friendId, page = 1, limit = 50) {
    return this.request(`/friends/${friendId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(friendId, content, type = 'text') {
    return this.request(`/friends/${friendId}/messages`, {
      method: 'POST',
      body: { content, type }
    });
  }

  async testConnection() {
    try {
      const health = await this.healthCheck();
      return { success: true, data: health };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
const apiService = new ApiService();
module.exports = apiService;   // optional: keeps CommonJS consumers working
export default apiService;     // <-- add this line so Vite/Rollup ES imports work // CommonJS export (works for both CJS/ESM bundlers)