const express = require('express');
const router = express.Router();

// Mock user database (replace with real database)
let usersDatabase = [
  {
    id: '1',
    name: 'Mike Rodriguez',
    displayName: 'Mike Rodriguez',
    username: 'mike_rodriguez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: {
      lat: 40.7128,
      lng: -74.0060
    },
    isOnline: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    displayName: 'Sarah Johnson',
    username: 'sarah_j',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    location: {
      lat: 51.5074,
      lng: -0.1278
    },
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Lisa Dubois',
    displayName: 'Lisa Dubois',
    username: 'lisa_dubois',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: {
      lat: 48.8566,
      lng: 2.3522
    },
    isOnline: true,
    lastSeen: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    id: '4',
    name: 'Alex Chen',
    displayName: 'Alex Chen',
    username: 'alex_chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: {
      lat: 19.0760,
      lng: 72.8777
    },
    isOnline: true,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '5',
    name: 'Emma Tanaka',
    displayName: 'Emma Tanaka',
    username: 'emma_tanaka',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    location: {
      lat: 35.6762,
      lng: 139.6503
    },
    isOnline: false,
    lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: '6',
    name: 'David Kim',
    displayName: 'David Kim',
    username: 'david_kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: {
      lat: -33.8688,
      lng: 151.2093
    },
    isOnline: true,
    lastSeen: new Date(Date.now() - 15 * 60 * 1000)
  }
];

// GET /api/users/:id/location - Get user's location
router.get('/:id/location', (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`📍 Fetching location for user ${userId}...`);
    
    const user = usersDatabase.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.location);
  } catch (error) {
    console.error(`Error fetching location for user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch user location' });
  }
});

// PUT /api/users/:id/location - Update user's location
router.put('/:id/location', (req, res) => {
  try {
    const userId = req.params.id;
    const { lat, lng } = req.body;
    console.log(`📍 Updating location for user ${userId}...`);
    
    const user = usersDatabase.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.location = { lat, lng };
    user.lastSeen = new Date();
    
    res.json(user.location);
  } catch (error) {
    console.error(`Error updating location for user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update user location' });
  }
});

const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/:id - Get user profile (fallback to mock if not in DB)
router.get('/:id', (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`👤 Fetching profile for user ${userId}...`);
    
    const user = usersDatabase.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /api/users/:id - Update user profile (MongoDB)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { displayName, bio, location, website, avatar } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { displayName, bio, location, website, avatar },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(updated.getPublicProfile());
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// POST /api/users - Create new user
router.post('/', (req, res) => {
  try {
    const { id, name, displayName, username, avatar, location } = req.body;
    console.log(`➕ Creating new user: ${name}...`);
    
    const newUser = {
      id,
      name,
      displayName: displayName || name,
      username,
      avatar,
      location: location || { lat: 0, lng: 0 },
      isOnline: true,
      lastSeen: new Date()
    };
    
    usersDatabase.push(newUser);
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;