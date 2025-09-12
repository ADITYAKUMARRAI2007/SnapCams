const express = require('express');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');
const { validateDuetCreation, validatePagination } = require('../middleware/validation');
const { postUpload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get duets
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const duets = await Post.find({ isPublic: true })
      .populate('author', 'username displayName avatar')
      .populate('originalPost', 'image caption author')
      .populate('responsePost', 'image caption author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        duets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Post.countDocuments({ isPublic: true })
        }
      }
    });
  } catch (error) {
    console.error('Get duets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get duets'
    });
  }
});

// Create duet
router.post('/post/:postId', authenticateToken, postUpload.single('image'), validateDuetCreation, handleUploadError, async (req, res) => {
  try {
    const { postId } = req.params;
    const { response } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Response image is required'
      });
    }
    
    // Check if original post exists
    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: 'Original post not found'
      });
    }
    
    // Create response post
    const responsePost = new Post({
      author: req.user._id,
      image: req.file.path,
      caption: response,
      hashtags: [],
      isPublic: true
    });
    
    await responsePost.save();
    
    // Create duet
    const duet = new Duet({
      originalPost: postId,
      responsePost: responsePost._id,
      author: req.user._id,
      response
    });
    
    await duet.save();
    
    // Add duet to original post
    originalPost.duets.push(duet._id);
    await originalPost.save();
    
    // Populate duet data
    await duet.populate('author', 'username displayName avatar');
    await duet.populate('originalPost', 'image caption author');
    await duet.populate('responsePost', 'image caption author');
    
    res.status(201).json({
      success: true,
      message: 'Duet created successfully',
      data: {
        duet
      }
    });
  } catch (error) {
    console.error('Create duet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create duet'
    });
  }
});

// Get specific duet
router.get('/:duetId', async (req, res) => {
  try {
    const { duetId } = req.params;
    
    const duet = await Post.findById(duetId)
      .populate('author', 'username displayName avatar')
      .populate('originalPost', 'image caption author')
      .populate('responsePost', 'image caption author');
    
    if (!duet) {
      return res.status(404).json({
        success: false,
        message: 'Duet not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        duet
      }
    });
  } catch (error) {
    console.error('Get duet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get duet'
    });
  }
});

// Get duets for a specific post
router.get('/post/:postId', validatePagination, async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const duets = await Post.getPostDuets(postId, page, limit);
    
    res.json({
      success: true,
      data: {
        duets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get post duets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post duets'
    });
  }
});

// Update duet
router.put('/:duetId', authenticateToken, async (req, res) => {
  try {
    const { duetId } = req.params;
    const { response } = req.body;
    
    const duet = await Post.findOne({ _id: duetId, author: req.user._id });
    
    if (!duet) {
      return res.status(404).json({
        success: false,
        message: 'Duet not found or not authorized'
      });
    }
    
    duet.response = response;
    await duet.save();
    
    // Update response post caption
    await Post.findByIdAndUpdate(duet.responsePost, {
      caption: response
    });
    
    // Populate duet data
    await duet.populate('author', 'username displayName avatar');
    await duet.populate('originalPost', 'image caption author');
    await duet.populate('responsePost', 'image caption author');
    
    res.json({
      success: true,
      message: 'Duet updated successfully',
      data: {
        duet
      }
    });
  } catch (error) {
    console.error('Update duet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update duet'
    });
  }
});

// Delete duet
router.delete('/:duetId', authenticateToken, async (req, res) => {
  try {
    const { duetId } = req.params;
    
    const duet = await Post.findOne({ _id: duetId, author: req.user._id });
    
    if (!duet) {
      return res.status(404).json({
        success: false,
        message: 'Duet not found or not authorized'
      });
    }
    
    // Remove duet from original post
    await Post.findByIdAndUpdate(duet.originalPost, {
      $pull: { duets: duetId }
    });
    
    // Delete response post
    await Post.findByIdAndDelete(duet.responsePost);
    
    // Delete the duet
    await Post.findByIdAndDelete(duetId);
    
    res.json({
      success: true,
      message: 'Duet deleted successfully'
    });
  } catch (error) {
    console.error('Delete duet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete duet'
    });
  }
});

// Like/Unlike duet
router.post('/:duetId/like', authenticateToken, async (req, res) => {
  try {
    const { duetId } = req.params;
    
    const duet = await Post.findById(duetId);
    
    if (!duet) {
      return res.status(404).json({
        success: false,
        message: 'Duet not found'
      });
    }
    
    const isLiked = duet.toggleLike(req.user._id);
    await duet.save();
    
    res.json({
      success: true,
      message: isLiked ? 'Duet liked' : 'Duet unliked',
      data: {
        isLiked,
        likesCount: duet.likesCount
      }
    });
  } catch (error) {
    console.error('Like duet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike duet'
    });
  }
});

// Get user duets
router.get('/user/:userId', validatePagination, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const duets = await Post.find({ author: userId, isPublic: true })
      .populate('author', 'username displayName avatar')
      .populate('originalPost', 'image caption author')
      .populate('responsePost', 'image caption author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        duets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Post.countDocuments({ author: userId, isPublic: true })
        }
      }
    });
  } catch (error) {
    console.error('Get user duets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user duets'
    });
  }
});

module.exports = router;





