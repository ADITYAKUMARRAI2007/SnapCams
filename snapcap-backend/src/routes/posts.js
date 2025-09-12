const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validatePostCreation, validatePagination } = require('../middleware/validation');
const { postUpload, handleUploadError } = require('../middleware/upload');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Get feed posts
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    
    // If user is authenticated, show posts from followed users
    if (req.user) {
      const user = await require('../models/User').findById(req.user._id);
      query.author = { $in: user.following };
    }
    
    const posts = await Post.find(query)
      .populate('author', 'username displayName avatar isOnline')
      .populate('comments', 'content author createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.isLikedBy(req.user._id);
      });
    }
    
    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Post.countDocuments(query)
        }
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feed'
    });
  }
});

// Generate AI caption for image
router.post('/generate-caption', authenticateToken, postUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    const { location, mood, timeOfDay } = req.body;
    
    // Get image from Cloudinary URL
    const imageUrl = req.file.path;
    
    // Fetch image from Cloudinary and convert to base64
    const fetch = require('node-fetch');
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.buffer();
    const imageBase64 = imageBuffer.toString('base64');
    
    // Generate AI caption
    const result = await geminiService.generateCaption(imageBase64, {
      location,
      mood,
      timeOfDay
    });
    
    res.json({
      success: true,
      data: {
        caption: result.caption,
        hashtags: result.hashtags,
        generated: result.generated
      }
    });
  } catch (error) {
    console.error('Generate caption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate caption'
    });
  }
});

// Create new post
router.post('/', authenticateToken, postUpload.single('image'), validatePostCreation, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    const { caption, hashtags, location } = req.body;
    
    const post = new Post({
      author: req.user._id,
      image: req.file.path,
      caption,
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      location: location ? JSON.parse(location) : null
    });
    
    await post.save();
    
    // Populate author data
    await post.populate('author', 'username displayName avatar');
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
});

// Get specific post
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId)
      .populate('author', 'username displayName avatar isOnline')
      .populate('comments', 'content author createdAt');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Add like status for authenticated users
    if (req.user) {
      post.isLiked = post.isLikedBy(req.user._id);
    }
    
    res.json({
      success: true,
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post'
    });
  }
});

// Update post
router.put('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, hashtags } = req.body;
    
    const post = await Post.findOne({ _id: postId, author: req.user._id });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not authorized'
      });
    }
    
    post.caption = caption || post.caption;
    post.hashtags = hashtags ? JSON.parse(hashtags) : post.hashtags;
    
    await post.save();
    
    await post.populate('author', 'username displayName avatar');
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
});

// Delete post
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findOne({ _id: postId, author: req.user._id });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not authorized'
      });
    }
    
    // Delete associated comments
    await Comment.deleteMany({ post: postId });
    
    // Delete the post
    await Post.findByIdAndDelete(postId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

// Like/Unlike post
router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const isLiked = post.toggleLike(req.user._id);
    await post.save();
    
    res.json({
      success: true,
      message: isLiked ? 'Post liked' : 'Post unliked',
      data: {
        isLiked,
        likesCount: post.likesCount
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike post'
    });
  }
});

// Save/Unsave post
router.post('/:postId/save', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    const isSaved = user.savedPosts.includes(postId);
    
    if (isSaved) {
      user.savedPosts.pull(postId);
    } else {
      user.savedPosts.push(postId);
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: isSaved ? 'Post unsaved' : 'Post saved',
      data: {
        isSaved: !isSaved
      }
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save/unsave post'
    });
  }
});

// Share post
router.post('/:postId/share', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    post.shares += 1;
    await post.save();
    
    res.json({
      success: true,
      message: 'Post shared successfully',
      data: {
        sharesCount: post.shares
      }
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post'
    });
  }
});

// Get post comments
router.get('/:postId/comments', validatePagination, async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const comments = await Comment.getPostComments(postId, page, limit);
    
    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comments'
    });
  }
});

// Get trending posts
router.get('/trending', optionalAuth, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get posts from last 7 days with high engagement
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const posts = await Post.find({
      isPublic: true,
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('author', 'username displayName avatar')
    .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.isLikedBy(req.user._id);
      });
    }
    
    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending posts'
    });
  }
});

// Get explore posts
router.get('/explore', optionalAuth, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ isPublic: true })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.isLikedBy(req.user._id);
      });
    }
    
    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get explore posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get explore posts'
    });
  }
});

// Generate AI captions
router.post('/generate-captions', authenticateToken, async (req, res) => {
  try {
    const { imageDescription, location, userMood } = req.body;
    
    let result;
    if (location) {
      result = await geminiService.generateLocationBasedCaption(location, imageDescription);
    } else {
      result = await geminiService.generateCaption(imageDescription, userMood);
    }
    
    res.json({
      success: true,
      message: 'Captions generated successfully',
      data: {
        captions: result.captions,
        aiSuccess: result.success
      }
    });
  } catch (error) {
    console.error('Generate captions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate captions'
    });
  }
});

module.exports = router;
