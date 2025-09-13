console.log("✅ Friends routes loaded");
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { authenticateToken } = require('../middleware/auth');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// Mock database for friends (replace with real database)
let friendsDatabase = [
  {
    id: '68c16d7ed3ffa114b597f1fe',
    name: 'Alexandra Dreams',
    displayName: 'Alexandra ✨',
    username: 'alexandra_dreams',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    location: {
      lat: 40.7128,
      lng: -74.0060
    }
  },
  {
    id: '68c16d7ed3ffa114b597f1ff',
    name: 'Cosmic Wanderer',
    displayName: 'Cosmic Soul 🌙',
    username: 'cosmic_wanderer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    location: {
      lat: 51.5074,
      lng: -0.1278
    }
  },
  {
    id: '68c16d7ed3ffa114b597f200',
    name: 'David Kim',
    displayName: 'David Kim',
    username: 'david_kim',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    location: {
      lat: 48.8566,
      lng: 2.3522
    }
  },
  {
    id: '4',
    name: 'Alex Chen',
    displayName: 'Alex Chen',
    username: 'alex_chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    location: {
      lat: 19.0760,
      lng: 72.8777
    }
  },
  {
    id: '5',
    name: 'Emma Tanaka',
    displayName: 'Emma Tanaka',
    username: 'emma_tanaka',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    isOnline: false,
    lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    location: {
      lat: 35.6762,
      lng: 139.6503
    }
  },
  {
    id: '6',
    name: 'David Kim',
    displayName: 'David Kim',
    username: 'david_kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    location: {
      lat: -33.8688,
      lng: 151.2093
    }
  }
];

// Mock posts database
let postsDatabase = {
  '1': [
    {
      id: '1_1',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop',
      caption: 'Central Park morning run! 🏃‍♂️ #NYC #Fitness',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 24,
      comments: 8
    },
    {
      id: '1_2',
      imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
      caption: 'Brooklyn Bridge at sunset 🌉 #Brooklyn #Sunset',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      likes: 42,
      comments: 12
    }
  ],
  '2': [
    {
      id: '2_1',
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=400&fit=crop',
      caption: 'Big Ben and Westminster! 🏛️ #London #UK',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      likes: 18,
      comments: 5
    }
  ],
  '3': [
    {
      id: '3_1',
      imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=400&fit=crop',
      caption: 'Eiffel Tower from Trocadéro! 🗼 #Paris #France',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      likes: 67,
      comments: 23
    },
    {
      id: '3_2',
      imageUrl: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400&h=400&fit=crop',
      caption: 'Louvre Pyramid at golden hour! 🏛️ #Louvre #Paris',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      likes: 89,
      comments: 31
    },
    {
      id: '3_3',
      imageUrl: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=400&h=400&fit=crop',
      caption: 'Café culture in Montmartre! ☕ #Montmartre #Paris',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 45,
      comments: 18
    }
  ],
  '4': [
    {
      id: '4_1',
      imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=400&fit=crop',
      caption: 'Gateway of India! 🏛️ #Mumbai #India',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      likes: 34,
      comments: 11
    },
    {
      id: '4_2',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      caption: 'Morning jog at Marine Drive! 🏃 #Fitness #Mumbai',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 28,
      comments: 7
    },
    {
      id: '4_3',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      caption: 'Street food adventure in Colaba! 🍜 #Foodie #Mumbai',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 52,
      comments: 19
    }
  ],
  '5': [
    {
      id: '5_1',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop',
      caption: 'Tokyo Skytree view! 🗼 #Tokyo #Japan',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 41,
      comments: 14
    }
  ],
  '6': [
    {
      id: '6_1',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      caption: 'Sydney Opera House! 🎭 #Sydney #Australia',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      likes: 73,
      comments: 25
    },
    {
      id: '6_2',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      caption: 'Harbour Bridge climb! 🌉 #HarbourBridge #Sydney',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      likes: 56,
      comments: 21
    },
    {
      id: '6_3',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      caption: 'Bondi Beach sunset! 🏖️ #Bondi #Sunset',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 89,
      comments: 33
    }
  ]
};

// GET /api/friends - Get all friends
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching friends list...');
    
    // Get all users from MongoDB
    const users = await User.find({})
      .select('username displayName avatar bio location isOnline lastSeen joinDate streak followers following isPrivate')
      .limit(20);
    
    // Transform the data to match frontend expectations
    const transformedFriends = users.map(user => ({
      id: user._id.toString(),
      name: user.displayName,
      displayName: user.displayName,
      username: user.username,
      avatar: user.avatar,
      profilePicture: user.avatar,
      bio: user.bio,
      location: user.location ? { 
        lat: parseFloat(user.location.split(',')[0]) || 0, 
        lng: parseFloat(user.location.split(',')[1]) || 0 
      } : { lat: 0, lng: 0 },
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      joinDate: user.joinDate,
      streak: user.streak,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isPrivate: user.isPrivate
    }));
    
    res.json(transformedFriends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// GET /api/friends/:id/posts - Get friend's posts
router.get('/:id/posts', async (req, res) => {
  try {
    const friendId = req.params.id;
    console.log(`📸 Fetching posts for friend ${friendId}...`);
    
    const posts = await Post.find({ author: friendId })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Transform posts to match frontend expectations
    const transformedPosts = posts.map(post => ({
      id: post._id.toString(),
      imageUrl: post.image,
      caption: post.caption,
      hashtags: post.hashtags,
      createdAt: post.createdAt,
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares,
      views: post.views,
      location: post.location
    }));
    
    res.json(transformedPosts);
  } catch (error) {
    console.error(`Error fetching posts for friend ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch friend posts' });
  }
});

// GET /api/friends/:id/location - Get friend's location
router.get('/:id/location', async (req, res) => {
  try {
    const friendId = req.params.id;
    console.log(`📍 Fetching location for friend ${friendId}...`);
    
    const user = await User.findById(friendId).select('location');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Parse location if it's a string
    let location = { lat: 0, lng: 0 };
    if (user.location) {
      const coords = user.location.split(',');
      if (coords.length === 2) {
        location = {
          lat: parseFloat(coords[0]) || 0,
          lng: parseFloat(coords[1]) || 0
        };
      }
    }
    
    res.json(location);
  } catch (error) {
    console.error(`Error fetching location for friend ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch friend location' });
  }
});

// POST /api/friends - Add new friend
router.post('/', (req, res) => {
  try {
    const { id, name, displayName, username, avatar, location } = req.body;
    console.log(`➕ Adding new friend: ${name}...`);
    
    const newFriend = {
      id,
      name,
      displayName: displayName || name,
      username,
      avatar,
      profilePicture: avatar,
      isOnline: true,
      lastSeen: new Date(),
      location
    };
    
    friendsDatabase.push(newFriend);
    postsDatabase[id] = []; // Initialize empty posts array
    
    res.status(201).json(newFriend);
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// DELETE /api/friends/:id - Remove friend
router.delete('/:id', (req, res) => {
  try {
    const friendId = req.params.id;
    console.log(`❌ Removing friend ${friendId}...`);
    
    const friendIndex = friendsDatabase.findIndex(f => f.id === friendId);
    if (friendIndex === -1) {
      return res.status(404).json({ error: 'Friend not found' });
    }
    
    friendsDatabase.splice(friendIndex, 1);
    delete postsDatabase[friendId];
    
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error(`Error removing friend ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// POST /api/friends/:id/posts - Add new post to friend
router.post('/:id/posts', (req, res) => {
  try {
    const friendId = req.params.id;
    const { imageUrl, caption } = req.body;
    console.log(`📸 Adding new post for friend ${friendId}...`);
    
    const newPost = {
      id: `${friendId}_${Date.now()}`,
      imageUrl,
      caption,
      createdAt: new Date(),
      likes: 0,
      comments: 0
    };
    
    if (!postsDatabase[friendId]) {
      postsDatabase[friendId] = [];
    }
    
    postsDatabase[friendId].unshift(newPost); // Add to beginning
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error(`Error adding post for friend ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to add post' });
  }
});

// PUT /api/friends/:id/location - Update friend's location
router.put('/:id/location', (req, res) => {
  try {
    const friendId = req.params.id;
    const { lat, lng } = req.body;
    console.log(`📍 Updating location for friend ${friendId}...`);
    
    const friend = friendsDatabase.find(f => f.id === friendId);
    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }
    
    friend.location = { lat, lng };
    
    res.json(friend.location);
  } catch (error) {
    console.error(`Error updating location for friend ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update friend location' });
  }
});

// POST /api/friends/:id/chat - Start a chat with a friend
router.post('/:id/chat', authenticateToken, async (req, res) => {
  try {
    const friendId = req.params.id;
    const currentUserId = req.user._id.toString();
    
    // Validate ObjectId
    if (!isValidObjectId(friendId)) {
      console.log(`❌ Invalid friend ID: ${friendId}`);
      return res.status(400).json({ error: 'Invalid friend ID format' });
    }
    
    console.log(`💬 Starting chat with friend ${friendId}...`);
    
    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, friendId] }
    });
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, friendId],
        unreadCount: new Map([
          [currentUserId.toString(), 0],
          [friendId.toString(), 0]
        ])
      });
      await conversation.save();
    }
    
    res.json({
      conversationId: conversation._id,
      message: 'Chat started successfully'
    });
  } catch (error) {
    console.error(`Error starting chat with friend ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to start chat' });
  }
});

// GET /api/friends/:id/messages - Get chat messages with a friend
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const friendId = req.params.id;
    const currentUserId = req.user._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    // Validate ObjectId
    if (!isValidObjectId(friendId)) {
      console.log(`❌ Invalid friend ID: ${friendId}`);
      return res.status(400).json({ error: 'Invalid friend ID format' });
    }
    
    console.log(`💬 Fetching messages with friend ${friendId}...`);
    
    // Find conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, friendId] }
    });
    
    if (!conversation) {
      return res.json([]);
    }
    
    // Get messages using the model method
    const messages = await Message.getConversationMessages(conversation._id, page, limit);
    
    res.json(messages);
  } catch (error) {
    console.error(`Error fetching messages with friend ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/friends/:id/messages - Send a message to a friend
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const friendId = req.params.id;
    const currentUserId = req.user._id.toString();
    const { content, type = 'text' } = req.body;
    
    // Validate ObjectId
    if (!isValidObjectId(friendId)) {
      console.log(`❌ Invalid friend ID: ${friendId}`);
      return res.status(400).json({ error: 'Invalid friend ID format' });
    }
    
    console.log(`💬 Sending message to friend ${friendId}...`);
    
    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, friendId] }
    });
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, friendId],
        unreadCount: new Map([
          [currentUserId.toString(), 0],
          [friendId.toString(), 0]
        ])
      });
      await conversation.save();
    }
    
    // Create message
    const message = new Message({
      sender: currentUserId,
      receiver: friendId,
      content,
      type,
      conversation: conversation._id
    });
    
    await message.save();
    
    // Update conversation with last message
    await conversation.updateLastMessage(message._id, currentUserId);
    
    res.status(201).json(message);
  } catch (error) {
    console.error(`Error sending message to friend ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
