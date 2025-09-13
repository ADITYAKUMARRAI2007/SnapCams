// src/services/websocketService.js
// Minimal changes to prefer VITE_SOCKET_BASE_URL and normalize to ws(s) scheme.

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }
  // determine best configured socket URL
  // inside class WebSocketService { ... }

getConfiguredUrl() {
  // prefer Vite style first
  let base = null;
  try {
    if ( typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_BASE_URL) {
      base = import.meta.env.VITE_SOCKET_BASE_URL;
    }
  } catch (e) { /* ignore */ }

  // fallback to old react env name
  if (!base && typeof process !== 'undefined' && process.env && process.env.REACT_APP_WS_URL) {
    base = process.env.REACT_APP_WS_URL;
  }

  // if still none, return null so caller uses the default
  if (!base) return null;

  // normalize protocol:
  // if user put https://api.example.com -> we want wss://api.example.com
  // if they put http:// -> ws://
  if (base.startsWith('https://')) {
    base = base.replace(/^https:\/\//i, 'wss://');
  } else if (base.startsWith('http://')) {
    base = base.replace(/^http:\/\//i, 'ws://');
  }

  // ensure some path — many servers expose ws on /ws or /socket
  // if user provided a host-only like wss://host.com or https://host.com,
  // append /ws so we don't try root which many servers don't accept.
  try {
    const u = new URL(base);
    if (!u.pathname || u.pathname === '/') {
      u.pathname = '/ws';
    }
    return u.toString();
  } catch (err) {
    // if it's not a full URL, attempt simple heuristics
    if (!base.includes('/')) return base + '/ws';
    return base;
  }
}

connect() {
  try {
    // build the URL
    const wsUrl = this.getConfiguredUrl() || 'ws://localhost:5001/ws';

    // optional token in query if backend expects JWT
    const token = (typeof window !== 'undefined' && localStorage.getItem('accessToken')) || null;
    const urlWithToken = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;

    console.log(`[websocketService] Attempting WebSocket connect to: ${urlWithToken}`);
    this.socket = new WebSocket(urlWithToken);

    this.socket.onopen = () => {
      console.log('🔌 WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (ev) => {
      console.log('🔌 WebSocket disconnected', ev);
      this.isConnected = false;
      this.emit('disconnected', ev);
      if (!ev.wasClean) {
        // show the close code for debugging
        console.warn('[websocketService] close code:', ev.code, 'reason:', ev.reason);
      }
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error: ', error);
      this.emit('error', error);
    };

  } catch (error) {
    console.error('Error connecting to WebSocket:', error);
  }
}

  // normalize http(s) -> ws(s) and return final url or null
  normalizeToWs(url) {
    if (!url) return null;
    // already ws/wss
    if (url.startsWith('ws://') || url.startsWith('wss://')) return url;
    // http(s) -> ws(s)
    if (url.startsWith('http://')) return url.replace(/^http:\/\//, 'ws://');
    if (url.startsWith('https://')) return url.replace(/^https:\/\//, 'wss://');
    // raw host/path: prefer wss on https pages
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
      return `wss://${url}`;
    }
    return `ws://${url}`;
  }

  // only fallback to localhost when page is running on localhost
  getSocketUrlOrNull() {
    const configured = this.getConfiguredUrl();
    if (configured) {
      return this.normalizeToWs(configured);
    }

    // development fallback: only attempt localhost if page is local
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return window.location.protocol === 'https:' ? 'wss://localhost:5001' : 'ws://localhost:5001';
      }
    }

    // production with no configured socket: don't connect
    return null;
  }

  // Connect to WebSocket server
  connect() {
    try {
      const wsUrl = this.getSocketUrlOrNull();

      if (!wsUrl) {
        console.warn('[websocketService] No socket URL configured; skipping WebSocket connection.');
        return;
      }

      // Avoid reconnecting if already open
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('[websocketService] Already connected to', this.socket.url);
        return;
      }

      console.log('[websocketService] Attempting WebSocket connect to:', wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('🔌 WebSocket connected to', wsUrl);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          // If message isn't JSON, emit raw
          this.emit('__raw__', event.data);
          console.error('Error parsing WebSocket message (falling back to raw):', error);
        }
      };

      this.socket.onclose = (ev) => {
        console.log('🔌 WebSocket disconnected', ev);
        this.isConnected = false;
        this.emit('disconnected', ev);
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  // Handle incoming messages (keeps your original message types)
  handleMessage(data) {
    const { type, payload } = data || {};
    switch (type) {
      case 'friend_posted':
        this.emit('friend_posted', payload);
        break;
      case 'friend_location_updated':
        this.emit('friend_location_updated', payload);
        break;
      case 'new_friend_added':
        this.emit('new_friend_added', payload);
        break;
      case 'friend_removed':
        this.emit('friend_removed', payload);
        break;
      case 'friend_online_status':
        this.emit('friend_online_status', payload);
        break;
      default:
        // unknown message type - forward as generic
        this.emit('__message__', data);
        console.log('Unknown WebSocket message type:', type);
    }
  }

  // Send message to server
  send(type, payload) {
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type,
        payload,
        timestamp: Date.now()
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event to listeners
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  // Attempt to reconnect
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      try { this.socket.close(); } catch (e) {}
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      listenersCount: this.listeners.size,
      url: this.socket ? this.socket.url : this.getConfiguredUrl()
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;