const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');
const { validateCommentCreation, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', validatePagination, async (req, res) => {
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

// Create new comment
router.post('/post/:postId', authenticateToken, validateCommentCreation, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if parent comment exists (for replies)
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }
    
    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content,
      parentComment: parentCommentId || null
    });
    
    await comment.save();
    
    // Add comment to post
    post.comments.push(comment._id);
    await post.save();
    
    // If this is a reply, add it to parent comment
    if (parentComment) {
      parentComment.replies.push(comment._id);
      await parentComment.save();
    }
    
    // Populate author data
    await comment.populate('author', 'username displayName avatar');
    
    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment'
    });
  }
});

// Get specific comment
router.get('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId)
      .populate('author', 'username displayName avatar')
      .populate('post', 'caption image')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username displayName avatar'
        }
      });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        comment
      }
    });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comment'
    });
  }
});

// Update comment
router.put('/:commentId', authenticateToken, validateCommentCreation, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    const comment = await Comment.findOne({ _id: commentId, author: req.user._id });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or not authorized'
      });
    }
    
    comment.content = content;
    await comment.save();
    
    // Populate author data
    await comment.populate('author', 'username displayName avatar');
    
    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment
      }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment'
    });
  }
});

// Delete comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findOne({ _id: commentId, author: req.user._id });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or not authorized'
      });
    }
    
    // Remove comment from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId }
    });
    
    // If this is a reply, remove it from parent comment
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId }
      });
    }
    
    // Delete all replies to this comment
    if (comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }
    
    // Delete the comment
    await Comment.findByIdAndDelete(commentId);
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
});

// Like/Unlike comment
router.post('/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    const isLiked = comment.toggleLike(req.user._id);
    await comment.save();
    
    res.json({
      success: true,
      message: isLiked ? 'Comment liked' : 'Comment unliked',
      data: {
        isLiked,
        likesCount: comment.likesCount
      }
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike comment'
    });
  }
});

// Pin/Unpin comment (post author only)
router.post('/:commentId/pin', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId).populate('post');
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is the post author
    if (comment.post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only post author can pin comments'
      });
    }
    
    comment.isPinned = !comment.isPinned;
    await comment.save();
    
    res.json({
      success: true,
      message: comment.isPinned ? 'Comment pinned' : 'Comment unpinned',
      data: {
        isPinned: comment.isPinned
      }
    });
  } catch (error) {
    console.error('Pin comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pin/unpin comment'
    });
  }
});

// Get comment replies
router.get('/:commentId/replies', validatePagination, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const replies = await Comment.find({ parentComment: commentId })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        replies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get comment replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comment replies'
    });
  }
});

module.exports = router;





