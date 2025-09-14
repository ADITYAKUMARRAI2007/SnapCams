// src/services/websocketService.js
import { io } from "socket.io-client";

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
    } catch (e) {}

    if (!base && typeof process !== "undefined" && process.env && process.env.REACT_APP_WS_URL) {
      base = process.env.REACT_APP_WS_URL;
    }

    if (!base) return null;

    // keep as-is for fallback; we'll convert for socket.io client
    return base;
  }

  // convert ws/wss to http(s) for socket.io client, otherwise return as http(s)
  _toHttpUrl(url) {
    if (!url) return null;
    if (url.startsWith("wss://")) return url.replace(/^wss:\/\//i, "https://");
    if (url.startsWith("ws://")) return url.replace(/^ws:\/\//i, "http://");
    // if it already starts with http/https, return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // otherwise assume https
    return `https://${url}`;
  }

  connect() {
    try {
      // === Use Socket.IO client (minimal change) ===
      // Pick configured base; prefer VITE_SOCKET_BASE_URL (http(s) or ws(s))
      const configured = this.getConfiguredUrl();
      // Default to current origin if not configured
      const base = configured || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");
      const socketUrl = this._toHttpUrl(base);

      // If a token exists, pass it via auth (socket.io recommended way)
      const token = (typeof window !== "undefined" && localStorage.getItem("accessToken")) || null;
      const auth = token ? { token } : undefined;

      // Avoid reconnecting if already open
      if (this.socket && this.socket.connected) {
        console.log("[websocketService] Already connected to", this.socket.io?.uri || this.socket?.id || socketUrl);
        return;
      }

      console.log("[websocketService] Attempting Socket.IO connect to:", socketUrl);

      // minimal options: force websocket transport to avoid polling if server supports it
      this.socket = io(socketUrl, {
        path: "/socket.io", // default; change if your server uses another path
        transports: ["websocket"],
        auth,
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
        console.error("❌ Socket.IO connection error:", err && err.message ? err.message : err);
        this.emit("error", err);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🔌 Socket.IO disconnected:", reason);
        this.isConnected = false;
        this.emit("disconnected", reason);
        // socket.io does built-in reconnects; we still keep attemptReconnect count for telemetry
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("❌ Max reconnection attempts reached (socket.io)");
        }
      });

      // forward server events you expect
      this.socket.on("friend_posted", (payload) => this.emit("friend_posted", payload));
      this.socket.on("friend_location_updated", (payload) => this.emit("friend_location_updated", payload));
      this.socket.on("new_friend_added", (payload) => this.emit("new_friend_added", payload));
      this.socket.on("friend_removed", (payload) => this.emit("friend_removed", payload));
      this.socket.on("friend_online_status", (payload) => this.emit("friend_online_status", payload));

      // also forward any event to local listeners
      if (typeof this.socket.onAny === "function") {
        this.socket.onAny((event, payload) => {
          // already forwarded known events above; this will also let you listen for any other event
          this.emit(event, payload);
        });
      }
    } catch (error) {
      console.error("Error connecting (socket.io):", error);
      // no manual attemptReconnect needed — socket.io will try; but keep for diagnostics
      this.reconnectAttempts++;
    }
  }

  // send/emit to server (use socket.io emit when using socket.io)
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

  // Keep your existing on/off/emit listener API (local listeners)
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

  // keep attemptReconnect for parity (socket.io auto reconnects by default)
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      // With socket.io, we can ask it to reconnect
      try {
        if (this.socket && typeof this.socket.connect === "function") {
          this.socket.connect();
        } else {
          // if no socket instance, call connect() which will create one
          this.connect();
        }
      } catch (e) {
        console.error("Error during attemptReconnect:", e);
      }
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.socket) {
      try {
        if (typeof this.socket.disconnect === "function") {
          this.socket.disconnect();
        } else if (typeof this.socket.close === "function") {
          this.socket.close();
        }
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
      url: this.socket && this.socket.io ? this.socket.io.uri : this.getConfiguredUrl(),
      socketId: this.socket ? this.socket.id : null,
    };
  }
}

const websocketService = new WebSocketService();
export default websocketService;