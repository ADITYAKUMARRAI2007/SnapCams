import websocketService from './websocketService';
import apiService from './apiService';

// Real-time Map Service for Live Friend Updates
class RealTimeMapService {
  constructor() {
    this.friends = new Map();
    this.listeners = new Set();
    this.pollingInterval = null;
    this.isPolling = false;
    this.lastUpdateTime = Date.now();
    this.useWebSocket = true;
    this.updateTimeout = null;
    this.isUpdating = false;
    
    // Set up WebSocket listeners
    this.setupWebSocketListeners();
  }

  // Set up WebSocket listeners
  setupWebSocketListeners() {
    if (!this.useWebSocket) return;

    // Friend posted new content
    websocketService.on('friend_posted', (data) => {
      console.log('📸 Real-time: Friend posted new content', data);
      this.addFriendPost(data.friendId, data.post);
    });

    // Friend location updated
    websocketService.on('friend_location_updated', (data) => {
      console.log('📍 Real-time: Friend location updated', data);
      this.updateFriendLocation(data.friendId, data.location);
    });

    // New friend added
    websocketService.on('new_friend_added', (data) => {
      console.log('➕ Real-time: New friend added', data);
      this.addNewFriend(data.friendId);
    });

    // Friend removed
    websocketService.on('friend_removed', (data) => {
      console.log('❌ Real-time: Friend removed', data);
      this.removeFriend(data.friendId);
    });

    // Friend online status changed
    websocketService.on('friend_online_status', (data) => {
      console.log('🟢 Real-time: Friend online status changed', data);
      this.updateFriendOnlineStatus(data.friendId, data.isOnline);
    });
  }

  // Add listener for real-time updates
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of updates
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(Array.from(this.friends.values()));
      } catch (error) {
        console.error('Error in real-time listener:', error);
      }
    });
  }

  // Fetch friends from backend API
  async fetchFriends() {
    try {
      const friendsData = await apiService.getFriends();
      return friendsData;
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  }

  // Fetch friend's recent posts
  async fetchFriendPosts(friendId) {
    try {
      const postsData = await apiService.getFriendPosts(friendId);
      return postsData;
    } catch (error) {
      console.error(`Error fetching posts for friend ${friendId}:`, error);
      return [];
    }
  }

  // Get user's current location (if available)
  async getUserLocation(userId) {
    try {
      const locationData = await apiService.getUserLocation(userId);
      return locationData;
    } catch (error) {
      console.error(`Error fetching location for user ${userId}:`, error);
      return null;
    }
  }

  // Process and format friend data for map
  async processFriendData(rawFriendData) {
    const processedFriends = [];

    for (const friend of rawFriendData) {
      try {
        // Fetch friend's recent posts
        const posts = await this.fetchFriendPosts(friend.id);
        
        // Get friend's location
        const location = await this.getUserLocation(friend.id);
        
        // If no location available, skip this friend
        if (!location || !location.lat || !location.lng) {
          console.warn(`No location data for friend ${friend.name}`);
          continue;
        }

        // Format posts as stories
        const stories = posts.map(post => ({
          id: post.id,
          image: post.imageUrl || post.image,
          caption: post.caption || post.description,
          timestamp: new Date(post.createdAt).getTime(),
          likes: post.likes || 0,
          comments: post.comments || 0
        }));

        // Create friend object for map
        const mapFriend = {
          id: friend.id,
          name: friend.displayName || friend.name,
          username: friend.username,
          avatar: friend.avatar || friend.profilePicture,
          location: {
            lat: location.lat,
            lng: location.lng
          },
          isOnline: friend.isOnline || false,
          lastSeen: this.formatLastSeen(friend.lastSeen),
          posts: stories,
          stories: stories // Same as posts for story functionality
        };

        processedFriends.push(mapFriend);
      } catch (error) {
        console.error(`Error processing friend ${friend.name}:`, error);
      }
    }

    return processedFriends;
  }

  // Format last seen time
  formatLastSeen(lastSeen) {
    if (!lastSeen) return 'Recently';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Active now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return 'Recently';
  }

  // Start real-time updates
  startPolling(intervalMs = 60000) { // Poll every 60 seconds (reduced frequency)
    if (this.isPolling) return;

    this.isPolling = true;
    console.log('🔄 Starting real-time map updates...');

    // Connect to WebSocket if enabled
    if (this.useWebSocket) {
      websocketService.connect();
    }

    // Initial fetch with debouncing
    this.debouncedUpdateFriendsData();

    // Set up polling as fallback
    this.pollingInterval = setInterval(() => {
      this.debouncedUpdateFriendsData();
    }, intervalMs);
  }

  // Stop real-time updates
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Disconnect WebSocket
    if (this.useWebSocket) {
      websocketService.disconnect();
    }
    
    this.isPolling = false;
    console.log('⏹️ Stopped real-time map updates');
  }

  // Debounced update to prevent excessive API calls
  debouncedUpdateFriendsData() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      this.updateFriendsData();
    }, 1000); // 1 second debounce
  }

  // Update friends data
  async updateFriendsData() {
    if (this.isUpdating) {
      console.log('⏳ Update already in progress, skipping...');
      return;
    }

    try {
      this.isUpdating = true;
      console.log('🔄 Updating friends data...');
      
      // Fetch fresh data from backend
      const rawFriendsData = await this.fetchFriends();
      
      // Process the data
      const processedFriends = await this.processFriendData(rawFriendsData);
      
      // Update internal friends map
      this.friends.clear();
      processedFriends.forEach(friend => {
        this.friends.set(friend.id, friend);
      });

      // Notify listeners
      this.notifyListeners();
      
      this.lastUpdateTime = Date.now();
      console.log(`✅ Updated ${processedFriends.length} friends on map`);
      
    } catch (error) {
      console.error('Error updating friends data:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  // Get current friends data
  getFriends() {
    return Array.from(this.friends.values());
  }

  // Add a new friend (when friendship is created)
  async addNewFriend(friendId) {
    try {
      console.log(`➕ Adding new friend ${friendId} to map...`);
      
      // Fetch friend data
      const friendData = await this.fetchFriends();
      const newFriend = friendData.find(f => f.id === friendId);
      
      if (!newFriend) {
        console.warn(`Friend ${friendId} not found`);
        return;
      }

      // Process and add to map
      const processedFriends = await this.processFriendData([newFriend]);
      if (processedFriends.length > 0) {
        const friend = processedFriends[0];
        this.friends.set(friend.id, friend);
        this.notifyListeners();
        console.log(`✅ Added new friend ${friend.name} to map`);
      }
      
    } catch (error) {
      console.error(`Error adding new friend ${friendId}:`, error);
    }
  }

  // Remove a friend (when friendship is deleted)
  removeFriend(friendId) {
    if (this.friends.has(friendId)) {
      const friend = this.friends.get(friendId);
      this.friends.delete(friendId);
      this.notifyListeners();
      console.log(`❌ Removed friend ${friend.name} from map`);
    }
  }

  // Update friend's location
  async updateFriendLocation(friendId, newLocation) {
    if (this.friends.has(friendId)) {
      const friend = this.friends.get(friendId);
      friend.location = newLocation;
      this.friends.set(friendId, friend);
      this.notifyListeners();
      console.log(`📍 Updated location for ${friend.name}`);
    }
  }

  // Add new post to friend's stories
  addFriendPost(friendId, post) {
    if (this.friends.has(friendId)) {
      const friend = this.friends.get(friendId);
      
      const newStory = {
        id: post.id,
        image: post.imageUrl || post.image,
        caption: post.caption || post.description,
        timestamp: new Date(post.createdAt).getTime(),
        likes: post.likes || 0,
        comments: post.comments || 0
      };

      friend.posts.unshift(newStory); // Add to beginning
      friend.stories = friend.posts; // Update stories
      
      this.friends.set(friendId, friend);
      this.notifyListeners();
      console.log(`📸 Added new post to ${friend.name}'s stories`);
    }
  }

  // Update friend's online status
  updateFriendOnlineStatus(friendId, isOnline) {
    if (this.friends.has(friendId)) {
      const friend = this.friends.get(friendId);
      friend.isOnline = isOnline;
      friend.lastSeen = new Date();
      this.friends.set(friendId, friend);
      this.notifyListeners();
      console.log(`🟢 Updated online status for ${friend.name}: ${isOnline ? 'Online' : 'Offline'}`);
    }
  }

  // Get service status
  getStatus() {
    return {
      isPolling: this.isPolling,
      friendsCount: this.friends.size,
      lastUpdateTime: this.lastUpdateTime,
      listenersCount: this.listeners.size,
      useWebSocket: this.useWebSocket,
      websocketStatus: this.useWebSocket ? websocketService.getStatus() : null
    };
  }
}

// Create singleton instance
const realTimeMapService = new RealTimeMapService();

export default realTimeMapService;
