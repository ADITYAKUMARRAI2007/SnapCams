// src/services/dataSyncService.js
// Data Synchronization Service - Handles all frontend-backend data sync

import apiService from './api';
import websocketService from './websocketService';

class DataSyncService {
  constructor() {
    this.isInitialized = false;
    this.syncInterval = null;
    this.listeners = new Set();
    this.cache = new Map();
    this.lastSyncTime = Date.now();
  }

  // Initialize the sync service
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing data sync service...');

      // --- Defensive connection check: prefer apiService.testConnection but fallback safely ---
      let connectionTest = null;

      if (apiService && typeof apiService.testConnection === 'function') {
        // Preferred: call testConnection if it exists
        connectionTest = await apiService.testConnection();
      } else if (apiService && typeof apiService.getCurrentUser === 'function') {
        // Fallback: call getCurrentUser if available (useful for token validation)
        try {
          connectionTest = await apiService.getCurrentUser();
        } catch (e) {
          connectionTest = null;
        }
      } else {
        // Last fallback: do a simple fetch to /api/auth/me (uses baseUrl if provided)
        try {
          const base = (apiService && apiService.baseUrl) || process.env.VITE_API_BASE_URL || '';
          const url = (base.endsWith('/') ? base.slice(0, -1) : base) + '/api/auth/me';
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json'
            },
          });
          if (res.ok) {
            // try to parse JSON, may vary by backend
            try {
              connectionTest = await res.json();
            } catch (_) {
              connectionTest = { success: true };
            }
          } else {
            connectionTest = { success: false, status: res.status };
          }
        } catch (err) {
          connectionTest = { success: false, error: err };
        }
      }

      // Validate result (support for different shapes: { success: true } or user payload)
      const ok =
        (connectionTest && connectionTest.success === true) ||
        (connectionTest && connectionTest.data && connectionTest.data.user) ||
        (connectionTest && connectionTest.id) || // maybe returned a user object directly
        (connectionTest && connectionTest.username) ||
        (connectionTest && connectionTest.email);

      if (!ok) {
        console.warn('⚠️ DataSyncService connection test failed:', connectionTest);
        throw new Error('Backend connection failed');
      }

      // Set up WebSocket connection (defensive: only if connect available)
      if (websocketService && typeof websocketService.connect === 'function') {
        websocketService.connect();
        this.setupWebSocketListeners();
      } else {
        console.warn('⚠️ websocketService.connect not available, skipping websocket setup');
      }

      // Start periodic sync
      this.startPeriodicSync();

      this.isInitialized = true;
      console.log('✅ Data sync service initialized');

    } catch (error) {
      console.error('❌ Failed to initialize data sync service:', error);
      throw error;
    }
  }

  // Set up WebSocket event listeners
  setupWebSocketListeners() {
    websocketService.on('friend_posted', (data) => {
      console.log('📸 Friend posted new content:', data);
      this.handleFriendPost(data);
    });

    websocketService.on('friend_location_updated', (data) => {
      console.log('📍 Friend location updated:', data);
      this.handleLocationUpdate(data);
    });

    websocketService.on('new_friend_added', (data) => {
      console.log('👥 New friend added:', data);
      this.handleNewFriend(data);
    });

    websocketService.on('friend_removed', (data) => {
      console.log('👋 Friend removed:', data);
      this.handleFriendRemoved(data);
    });

    websocketService.on('friend_online_status', (data) => {
      console.log('🟢 Friend online status changed:', data);
      this.handleOnlineStatusChange(data);
    });
  }

  // Handle friend post events
  handleFriendPost(data) {
    const { friendId, post } = data;

    // Update cache
    if (this.cache.has('friends')) {
      const friends = this.cache.get('friends');
      const friendIndex = friends.findIndex(f => f.id === friendId);

      if (friendIndex !== -1) {
        // Add new post to friend's stories
        if (!friends[friendIndex].stories) {
          friends[friendIndex].stories = [];
        }

        // Convert post to story format
        const story = {
          id: post.id,
          image: post.imageUrl || post.image || post.photoUrl,
          caption: post.caption,
          timestamp: new Date(post.createdAt || post.timestamp || Date.now()).getTime(),
          likes: post.likes || 0,
          comments: post.comments || 0
        };

        friends[friendIndex].stories.unshift(story);

        // Keep only last 10 stories
        if (friends[friendIndex].stories.length > 10) {
          friends[friendIndex].stories = friends[friendIndex].stories.slice(0, 10);
        }

        this.cache.set('friends', friends);
        this.notifyListeners('friends_updated', friends);
      }
    }
  }

  // Handle location updates
  handleLocationUpdate(data) {
    const { friendId, location } = data;

    if (this.cache.has('friends')) {
      const friends = this.cache.get('friends');
      const friendIndex = friends.findIndex(f => f.id === friendId);

      if (friendIndex !== -1) {
        friends[friendIndex].location = location;
        this.cache.set('friends', friends);
        this.notifyListeners('friends_updated', friends);
      }
    }
  }

  // Handle new friend addition
  handleNewFriend(data) {
    const { friend } = data;

    if (this.cache.has('friends')) {
      const friends = this.cache.get('friends');

      // Check if friend already exists
      const existingIndex = friends.findIndex(f => f.id === friend.id);
      if (existingIndex === -1) {
        // Add new friend
        friends.push(friend);
        this.cache.set('friends', friends);
        this.notifyListeners('friends_updated', friends);
      }
    }
  }

  // Handle friend removal
  handleFriendRemoved(data) {
    const { friendId } = data;

    if (this.cache.has('friends')) {
      const friends = this.cache.get('friends');
      const filteredFriends = friends.filter(f => f.id !== friendId);
      this.cache.set('friends', filteredFriends);
      this.notifyListeners('friends_updated', filteredFriends);
    }
  }

  // Handle online status changes
  handleOnlineStatusChange(data) {
    const { friendId, isOnline, lastSeen } = data;

    if (this.cache.has('friends')) {
      const friends = this.cache.get('friends');
      const friendIndex = friends.findIndex(f => f.id === friendId);

      if (friendIndex !== -1) {
        friends[friendIndex].isOnline = isOnline;
        friends[friendIndex].lastSeen = lastSeen;
        this.cache.set('friends', friends);
        this.notifyListeners('friends_updated', friends);
      }
    }
  }

  // Start periodic synchronization
  startPeriodicSync(intervalMs = 60000) { // 1 minute
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncAllData();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    }, intervalMs);
  }

  // Stop periodic synchronization
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync all data from backend
  async syncAllData() {
    try {
      console.log('🔄 Syncing all data...');

      // Sync friends data
      let friends = [];
      if (apiService && typeof apiService.getFriends === 'function') {
        friends = await apiService.getFriends();
      } else {
        // if apiService.getFriends not present, don't throw — just set empty
        friends = [];
      }

      this.cache.set('friends', friends);
      this.notifyListeners('friends_updated', friends);

      this.lastSyncTime = Date.now();
      console.log('✅ Data sync completed');

    } catch (error) {
      console.error('❌ Data sync failed:', error);
      throw error;
    }
  }

  // Get cached data
  getCachedData(key) {
    return this.cache.get(key);
  }

  // Set cached data
  setCachedData(key, data) {
    this.cache.set(key, data);
    this.notifyListeners(`${key}_updated`, data);
  }

  // Add event listener
  addListener(callback) {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Get sync status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      lastSyncTime: this.lastSyncTime,
      cacheSize: this.cache.size,
      listenersCount: this.listeners.size,
      websocketStatus: websocketService.getStatus ? websocketService.getStatus() : null
    };
  }

  // Cleanup
  destroy() {
    this.stopPeriodicSync();
    if (websocketService && typeof websocketService.disconnect === 'function') {
      websocketService.disconnect();
    }
    this.listeners.clear();
    this.cache.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
const dataSyncService = new DataSyncService();

export default dataSyncService;