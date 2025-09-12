// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes (adjust paths if needed)
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const postRoutes = require('./src/routes/posts');
const storyRoutes = require('./src/routes/stories');
const commentRoutes = require('./src/routes/comments');
const duetRoutes = require('./src/routes/duets');
const chatRoutes = require('./src/routes/chat');
const notificationRoutes = require('./src/routes/notifications');
const searchRoutes = require('./src/routes/search');
const friendsRoutes = require('./src/routes/friends');

// Import socket handlers
const socketHandler = require('./src/socket/socketHandler');

const app = express();
const server = createServer(app);

// Build allowed origins list
const clientEnv = process.env.CLIENT_URL || '';
const clientEnvList = clientEnv
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  'http://localhost:3000',
  'https://snapcams.onrender.com',
  'https://snapcap-backend.onrender.com',
  'https://snapscam.netlify.app',
  ...clientEnvList
]));

// Init Socket.IO with CORS configured to same allowed origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes if needed
app.set('io', io);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS middleware for all routes — this handles preflight automatically
app.use(cors({
  origin: (origin, cb) => {
    // allow non-browser (no origin) requests
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snapcap';
mongoose.connect(MONGODB_URI, { autoIndex: false })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SnapCap API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/duets', duetRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/friends', friendsRoutes);

// Socket handler (your implementation)
socketHandler(io);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err && err.message ? err.message : err);
  if (!err) return next();

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// Graceful shutdown
const shutdown = async (signal) => {
  try {
    console.log(`${signal} received. Shutting down gracefully...`);
    // stop accepting new connections
    server.close(() => {
      console.log('HTTP server closed');
    });
    // close mongoose connection (returns a promise)
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (e) {
    console.error('Error during shutdown', e);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 SnapCap API server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;