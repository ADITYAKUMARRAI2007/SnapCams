const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Optional authentication (for public endpoints)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user is the owner of the resource
const checkOwnership = (resourceModel, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user is the owner
      if (resource.author && resource.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not the owner'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Ownership check failed'
      });
    }
  };
};

// Check if user is blocked
const checkBlocked = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.body.userId;
    
    if (!targetUserId) {
      return next();
    }

    const targetUser = await User.findById(targetUserId);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user is blocked by target user
    if (targetUser.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are blocked by this user'
      });
    }

    // Check if target user is blocked by current user
    if (req.user.blockedUsers.includes(targetUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You have blocked this user'
      });
    }

    req.targetUser = targetUser;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Block check failed'
    });
  }
};

// Rate limiting for specific actions
const createRateLimit = (windowMs, maxRequests, message) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later'
      });
    }

    userRequests.push(now);
    requests.set(key, userRequests);
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  checkOwnership,
  checkBlocked,
  createRateLimit
};
