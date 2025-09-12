// src/routes/stories.js
const express = require('express');
const mongoose = require('mongoose');
const Story = require('../models/Story');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateStoryCreation } = require('../middleware/validation');
const { storyUpload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Helper to validate ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

// ----------------------
// Public: get active stories
// ----------------------
router.get('/', optionalAuth, async (req, res) => {
  try {
    const stories = await Story.getActiveStories();

    if (req.user) {
      stories.forEach(story => {
        // method on model instance assumed to exist
        story.isViewed = typeof story.isViewedBy === 'function' ? story.isViewedBy(req.user._id) : false;
      });
    }

    return res.json({ success: true, data: { stories } });
  } catch (error) {
    console.error('Get stories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get stories' });
  }
});

// ----------------------
// Admin / maintenance: cleanup expired stories
// (kept as POST to avoid accidental GET triggering)
// ----------------------
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    // TODO: restrict to admin users if needed (check req.user.role etc.)
    const result = await Story.cleanExpiredStories();
    return res.json({ success: true, message: 'Expired stories cleaned up successfully', data: { modifiedCount: result.modifiedCount || 0 } });
  } catch (error) {
    console.error('Cleanup stories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cleanup expired stories' });
  }
});

// ----------------------
// Public: get user stories
// Place before /:storyId to avoid param clobbering
// ----------------------
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const stories = await Story.find({
      author: userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('author', 'username displayName avatar isOnline')
    .sort({ createdAt: -1 });

    if (req.user) {
      stories.forEach(story => {
        story.isViewed = typeof story.isViewedBy === 'function' ? story.isViewedBy(req.user._id) : false;
      });
    }

    return res.json({ success: true, data: { stories } });
  } catch (error) {
    console.error('Get user stories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get user stories' });
  }
});

// ----------------------
// Create new story (authenticated)
// image under `image` form field
// ----------------------
router.post('/', authenticateToken, storyUpload.single('image'), validateStoryCreation, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const { caption = '', music, textOverlay } = req.body;

    // safely parse music/textOverlay if sent as JSON strings
    let musicObj = null;
    let textOverlayObj = null;
    try { musicObj = music ? JSON.parse(music) : null; } catch (e) { /* ignore parse, will store raw */ }
    try { textOverlayObj = textOverlay ? JSON.parse(textOverlay) : null; } catch (e) { /* ignore parse */ }

    const story = new Story({
      author: req.user._id,
      content: [{
        image: req.file.path,
        caption,
        music: musicObj || (music || null),
        textOverlay: textOverlayObj || (textOverlay || null)
      }]
    });

    await story.save();
    await story.populate('author', 'username displayName avatar isOnline');

    return res.status(201).json({ success: true, message: 'Story created successfully', data: { story } });
  } catch (error) {
    console.error('Create story error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create story' });
  }
});

// ----------------------
// Add content to existing story (authenticated)
// ----------------------
router.post('/:storyId/content', authenticateToken, storyUpload.single('image'), validateStoryCreation, handleUploadError, async (req, res) => {
  try {
    const { storyId } = req.params;
    if (!isValidObjectId(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid storyId' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const { caption = '', music, textOverlay } = req.body;
    let musicObj = null, textOverlayObj = null;
    try { musicObj = music ? JSON.parse(music) : null; } catch (e) {}
    try { textOverlayObj = textOverlay ? JSON.parse(textOverlay) : null; } catch (e) {}

    const story = await Story.findOne({ _id: storyId, author: req.user._id });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found or not authorized' });
    }

    if (!story.isActive || story.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot add content to expired story' });
    }

    story.content.push({
      image: req.file.path,
      caption,
      music: musicObj || (music || null),
      textOverlay: textOverlayObj || (textOverlay || null)
    });

    await story.save();
    await story.populate('author', 'username displayName avatar isOnline');

    return res.json({ success: true, message: 'Content added to story successfully', data: { story } });
  } catch (error) {
    console.error('Add story content error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add content to story' });
  }
});

// ----------------------
// Get specific story (public read; enrich if authenticated)
// This route must come after /user/:userId
// ----------------------
router.get('/:storyId', optionalAuth, async (req, res) => {
  try {
    const { storyId } = req.params;
    if (!isValidObjectId(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid storyId' });
    }

    const story = await Story.findById(storyId)
      .populate('author', 'username displayName avatar isOnline');

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (!story.isActive || story.expiresAt < new Date()) {
      return res.status(404).json({ success: false, message: 'Story has expired' });
    }

    if (req.user && typeof story.isViewedBy === 'function') {
      story.isViewed = story.isViewedBy(req.user._id);
    }

    return res.json({ success: true, data: { story } });
  } catch (error) {
    console.error('Get story error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get story' });
  }
});

// ----------------------
// Mark story as viewed
// ----------------------
router.post('/:storyId/view', authenticateToken, async (req, res) => {
  try {
    const { storyId } = req.params;
    if (!isValidObjectId(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid storyId' });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    if (!story.isActive || story.expiresAt < new Date()) {
      return res.status(404).json({ success: false, message: 'Story has expired' });
    }

    const isNewView = typeof story.addView === 'function' ? story.addView(req.user._id) : false;
    await story.save();

    return res.json({
      success: true,
      message: isNewView ? 'Story marked as viewed' : 'Story already viewed',
      data: { isViewed: true, viewsCount: story.viewsCount || 0 }
    });
  } catch (error) {
    console.error('View story error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark story as viewed' });
  }
});

// ----------------------
// Delete story (owner only)
// ----------------------
router.delete('/:storyId', authenticateToken, async (req, res) => {
  try {
    const { storyId } = req.params;
    if (!isValidObjectId(storyId)) {
      return res.status(400).json({ success: false, message: 'Invalid storyId' });
    }

    const story = await Story.findOne({ _id: storyId, author: req.user._id });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found or not authorized' });
    }

    await Story.findByIdAndDelete(storyId);

    return res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete story' });
  }
});

module.exports = router;