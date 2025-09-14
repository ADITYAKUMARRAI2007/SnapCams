// src/services/websocketService.js
import { io } from "socket.io-client";
window.io = io;
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Prefer Vite env, fallback to old react env or nothing
  getConfiguredUrl() {
    try {
      if ( typeof import.meta !== "undefined" && import.meta.env?.VITE_SOCKET_BASE_URL) {
        return import.meta.env.VITE_SOCKET_BASE_URL;
      }
    } catch (e) {}
    if (typeof process !== "undefined" && process.env?.REACT_APP_WS_URL) {
      return process.env.REACT_APP_WS_URL;
    }
    return null;
  }

  // Convert possible ws/wss or http/https/bare-host to http(s) URL for socket.io client
  _toHttpUrl(url) {
    if (!url) return null;
    if (url.startsWith("wss://")) return url.replace(/^wss:\/\//i, "https://");
    if (url.startsWith("ws://")) return url.replace(/^ws:\/\//i, "http://");
    if (url.startsWith("https://") || url.startsWith("http://")) return url;
    return `https://${url}`;
  }

  connect() {
    try {
      const configured = this.getConfiguredUrl();
      const base = configured || (typeof window !== "undefined" ? window.location.origin : "https://localhost");
      const socketUrl = this._toHttpUrl(base);

      // If already connected, skip
      if (this.socket && this.socket.connected) {
        console.log("[websocketService] Already connected to", this.socket.id || socketUrl);
        return;
      }

      // token for auth (if backend expects)
      const token = (typeof window !== "undefined" && localStorage.getItem("accessToken")) || null;
      const auth = token ? { token } : undefined;

      console.log("[websocketService] Attempting Socket.IO connect to:", socketUrl);

      // Create socket.io client. Do NOT force websocket-only so fallback works.
      this.socket = io(socketUrl, {
        path: "/socket.io",
        auth,
        withCredentials: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on("connect", () => {
        console.log("🔌 Socket.IO connected", this.socket.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit("connected", { id: this.socket.id });
      });

      this.socket.on("connect_error", (err) => {
        console.error("❌ Socket.IO connect_error:", err && err.message ? err.message : err);
        this.emit("error", err);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🔌 Socket.IO disconnected:", reason);
        this.isConnected = false;
        this.emit("disconnected", reason);
      });

      // forward server events expected by your app
      this.socket.on("friend_posted", (payload) => this.emit("friend_posted", payload));
      this.socket.on("friend_location_updated", (payload) => this.emit("friend_location_updated", payload));
      this.socket.on("new_friend_added", (payload) => this.emit("new_friend_added", payload));
      this.socket.on("friend_removed", (payload) => this.emit("friend_removed", payload));
      this.socket.on("friend_online_status", (payload) => this.emit("friend_online_status", payload));

      // onAny -> forward any event to local listeners (optional)
      if (typeof this.socket.onAny === "function") {
        this.socket.onAny((event, payload) => {
          this.emit(event, payload);
        });
      }
    } catch (error) {
      console.error("Error connecting (socket.io):", error);
      this.reconnectAttempts++;
    }
  }

  // emit to server
  send(type, payload) {
    if (this.socket && this.socket.connected) {
      try {
        this.socket.emit(type, payload);
      } catch (e) {
        console.error("Error emitting via socket.io:", e);
      }
    } else {
      console.warn("Socket not connected, cannot send message:", type);
    }
  }

  // local listener API
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const arr = this.listeners.get(event);
    const idx = arr.indexOf(callback);
    if (idx > -1) arr.splice(idx, 1);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(cb => {
      try { cb(data); } catch (e) { console.error(`Listener error for ${event}:`, e); }
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempt reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      try {
        if (this.socket && typeof this.socket.connect === "function") this.socket.connect();
        else this.connect();
      } catch (e) { console.error("Error during attemptReconnect:", e); }
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.socket) {
      try {
        if (typeof this.socket.disconnect === "function") this.socket.disconnect();
        else if (typeof this.socket.close === "function") this.socket.close();
      } catch (e) {}
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
      url: this.socket && this.socket.io ? (this.socket.io?.uri || this.getConfiguredUrl()) : this.getConfiguredUrl(),
      socketId: this.socket ? this.socket.id : null,
    };
  }
}

const websocketService = new WebSocketService();
export default websocketService;