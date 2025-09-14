// src/services/websocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  getConfiguredUrl() {
    let base = null;
    try {
      if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SOCKET_BASE_URL) {
        base = import.meta.env.VITE_SOCKET_BASE_URL;
      }
    } catch (e) {
    }

    if (!base && typeof process !== "undefined" && process.env && process.env.REACT_APP_WS_URL) {
      base = process.env.REACT_APP_WS_URL;
    }

    if (!base) return null;

    // normalize protocol
    if (base.startsWith("https://")) {
      base = base.replace(/^https:\/\//i, "wss://");
    } else if (base.startsWith("http://")) {
      base = base.replace(/^http:\/\//i, "ws://");
    }

    return base; // ✅ don't force-append "/ws" here
  }

  connect() {
    try {
      const wsUrl = this.getConfiguredUrl() || "ws://localhost:5001";
      const token = (typeof window !== "undefined" && localStorage.getItem("accessToken")) || null;
      const urlWithToken = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;

      console.log(`[websocketService] Attempting WebSocket connect to: ${urlWithToken}`);
      this.socket = new WebSocket(urlWithToken);

      this.socket.onopen = () => {
        console.log("🔌 WebSocket connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit("connected");
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          this.emit("__raw__", event.data);
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = (ev) => {
        console.log("🔌 WebSocket disconnected", ev);
        this.isConnected = false;
        this.emit("disconnected", ev);
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      this.attemptReconnect();
    }
  }

  handleMessage(data) {
    const { type, payload } = data || {};
    switch (type) {
      case "friend_posted":
        this.emit("friend_posted", payload);
        break;
      case "friend_location_updated":
        this.emit("friend_location_updated", payload);
        break;
      case "new_friend_added":
        this.emit("new_friend_added", payload);
        break;
      case "friend_removed":
        this.emit("friend_removed", payload);
        break;
      case "friend_online_status":
        this.emit("friend_online_status", payload);
        break;
      default:
        this.emit("__message__", data);
        console.log("Unknown WebSocket message type:", type);
    }
  }

  send(type, payload) {
    if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = { type, payload, timestamp: Date.now() };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      listenersCount: this.listeners.size,
      url: this.socket ? this.socket.url : this.getConfiguredUrl(),
    };
  }
}

const websocketService = new WebSocketService();
export default websocketService;