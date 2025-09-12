const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// Search users
router.get('/users', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { displayName: searchRegex }
      ],
      _id: { $ne: req.user._id } // Exclude current user
    })
    .select('username displayName avatar bio isOnline lastSeen followers following')
    .skip(skip)
    .limit(parseInt(limit));
    
    // Add follow status
    const usersWithFollowStatus = users.map(user => {
      const userObj = user.toObject();
      userObj.isFollowing = req.user.following.includes(user._id);
      userObj.followersCount = user.followers.length;
      userObj.followingCount = user.following.length;
      return userObj;
    });
    
    res.json({
      success: true,
      data: {
        users: usersWithFollowStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await User.countDocuments({
            $or: [
              { username: searchRegex },
              { displayName: searchRegex }
            ],
            _id: { $ne: req.user._id }
          })
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

// Search posts
router.get('/posts', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(q.trim(), 'i');
    
    const posts = await Post.find({
      $or: [
        { caption: searchRegex },
        { hashtags: { $in: [searchRegex] } }
      ],
      isPublic: true
    })
    .populate('author', 'username displayName avatar isOnline')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    // Add like status
    posts.forEach(post => {
      post.isLiked = post.isLikedBy(req.user._id);
    });
    
    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Post.countDocuments({
            $or: [
              { caption: searchRegex },
              { hashtags: { $in: [searchRegex] } }
            ],
            isPublic: true
          })
        }
      }
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search posts'
    });
  }
});

// Search hashtags
router.get('/hashtags', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(q.trim(), 'i');
    
    // Get unique hashtags with post counts
    const hashtags = await Post.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$hashtags' },
      { $match: { hashtags: searchRegex } },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          latestPost: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1, latestPost: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      success: true,
      data: {
        hashtags: hashtags.map(tag => ({
          hashtag: tag._id,
          postCount: tag.count,
          latestPost: tag.latestPost
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search hashtags'
    });
  }
});

// Get trending hashtags
router.get('/trending/hashtags', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get hashtags from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const trendingHashtags = await Post.aggregate([
      { 
        $match: { 
          isPublic: true,
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          latestPost: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1, latestPost: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      success: true,
      data: {
        hashtags: trendingHashtags.map(tag => ({
          hashtag: tag._id,
          postCount: tag.count,
          latestPost: tag.latestPost
        }))
      }
    });
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending hashtags'
    });
  }
});

// Get posts by hashtag
router.get('/hashtag/:hashtag', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({
      hashtags: hashtag,
      isPublic: true
    })
    .populate('author', 'username displayName avatar isOnline')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    // Add like status
    posts.forEach(post => {
      post.isLiked = post.isLikedBy(req.user._id);
    });
    
    res.json({
      success: true,
      data: {
        posts,
        hashtag,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Post.countDocuments({
            hashtags: hashtag,
            isPublic: true
          })
        }
      }
    });
  } catch (error) {
    console.error('Get posts by hashtag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts by hashtag'
    });
  }
});

// Global search (users, posts, hashtags)
router.get('/global', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const searchRegex = new RegExp(q.trim(), 'i');
    const skip = (page - 1) * limit;
    
    // Search users
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { displayName: searchRegex }
      ],
      _id: { $ne: req.user._id }
    })
    .select('username displayName avatar bio isOnline lastSeen')
    .limit(5);
    
    // Search posts
    const posts = await Post.find({
      $or: [
        { caption: searchRegex },
        { hashtags: { $in: [searchRegex] } }
      ],
      isPublic: true
    })
    .populate('author', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Search hashtags
    const hashtags = await Post.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$hashtags' },
      { $match: { hashtags: searchRegex } },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Add like status to posts
    posts.forEach(post => {
      post.isLiked = post.isLikedBy(req.user._id);
    });
    
    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          ...user.toObject(),
          isFollowing: req.user.following.includes(user._id)
        })),
        posts,
        hashtags: hashtags.map(tag => ({
          hashtag: tag._id,
          postCount: tag.count
        }))
      }
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform global search'
    });
  }
});

module.exports = router;





