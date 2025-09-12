const express = require('express');
const Story = require('../models/Story');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateStoryCreation, validatePagination } = require('../middleware/validation');
const { storyUpload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get active stories (public in production with optional auth so unauthenticated users can view)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const stories = await Story.getActiveStories();
    
    // Add view status for current user when available
    if (req.user) {
      stories.forEach(story => {
        story.isViewed = story.isViewedBy(req.user._id);
      });
    }
    
    res.json({
      success: true,
      data: {
        stories
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stories'
    });
  }
});

// Create new story
router.post('/', authenticateToken, storyUpload.single('image'), validateStoryCreation, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    const { caption, music, textOverlay } = req.body;
    
    const story = new Story({
      author: req.user._id,
      content: [{
        image: req.file.path,
        caption: caption || '',
        music: music ? JSON.parse(music) : null,
        textOverlay: textOverlay ? JSON.parse(textOverlay) : null
      }]
    });
    
    await story.save();
    
    // Populate author data
    await story.populate('author', 'username displayName avatar isOnline');
    
    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      data: {
        story
      }
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create story'
    });
  }
});

// Get specific story (public read; enrich if authenticated)
router.get('/:storyId', optionalAuth, async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const story = await Story.findById(storyId)
      .populate('author', 'username displayName avatar isOnline');
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    // Check if story is expired
    if (!story.isActive || story.expiresAt < new Date()) {
      return res.status(404).json({
        success: false,
        message: 'Story has expired'
      });
    }
    
    if (req.user) {
      story.isViewed = story.isViewedBy(req.user._id);
    }
    
    res.json({
      success: true,
      data: {
        story
      }
    });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get story'
    });
  }
});

// Mark story as viewed
router.post('/:storyId/view', authenticateToken, async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    // Check if story is expired
    if (!story.isActive || story.expiresAt < new Date()) {
      return res.status(404).json({
        success: false,
        message: 'Story has expired'
      });
    }
    
    const isNewView = story.addView(req.user._id);
    await story.save();
    
    res.json({
      success: true,
      message: isNewView ? 'Story marked as viewed' : 'Story already viewed',
      data: {
        isViewed: true,
        viewsCount: story.viewsCount
      }
    });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark story as viewed'
    });
  }
});

// Delete story
router.delete('/:storyId', authenticateToken, async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const story = await Story.findOne({ _id: storyId, author: req.user._id });
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found or not authorized'
      });
    }
    
    await Story.findByIdAndDelete(storyId);
    
    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete story'
    });
  }
});

// Get user stories (public read; enrich if authenticated)
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stories = await Story.find({ 
      author: userId, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('author', 'username displayName avatar isOnline')
    .sort({ createdAt: -1 });
    
    // Add view status for current user when available
    if (req.user) {
      stories.forEach(story => {
        story.isViewed = story.isViewedBy(req.user._id);
      });
    }
    
    res.json({
      success: true,
      data: {
        stories
      }
    });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user stories'
    });
  }
});

// Add content to existing story
router.post('/:storyId/content', authenticateToken, storyUpload.single('image'), validateStoryCreation, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    const { storyId } = req.params;
    const { caption, music, textOverlay } = req.body;
    
    const story = await Story.findOne({ _id: storyId, author: req.user._id });
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found or not authorized'
      });
    }
    
    // Check if story is expired
    if (!story.isActive || story.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add content to expired story'
      });
    }
    
    // Add new content
    story.content.push({
      image: req.file.path,
      caption: caption || '',
      music: music ? JSON.parse(music) : null,
      textOverlay: textOverlay ? JSON.parse(textOverlay) : null
    });
    
    await story.save();
    
    // Populate author data
    await story.populate('author', 'username displayName avatar isOnline');
    
    res.json({
      success: true,
      message: 'Content added to story successfully',
      data: {
        story
      }
    });
  } catch (error) {
    console.error('Add story content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add content to story'
    });
  }
});

// Clean expired stories (admin endpoint)
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // Only allow admin users to clean up stories
    // For now, we'll allow any authenticated user
    const result = await Story.cleanExpiredStories();
    
    res.json({
      success: true,
      message: 'Expired stories cleaned up successfully',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Cleanup stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired stories'
    });
  }
});

module.exports = router;





