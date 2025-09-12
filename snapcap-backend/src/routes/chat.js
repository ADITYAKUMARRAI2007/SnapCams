const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { authenticateToken } = require('../middleware/auth');
const { validateMessageCreation, validatePagination } = require('../middleware/validation');
const { messageUpload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get user conversations
router.get('/conversations', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const conversations = await Conversation.getUserConversations(req.user._id, page, limit);
    
    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
});

// Start new conversation or get existing one
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { receiverId } = req.body;
    
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }
    
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start conversation with yourself'
      });
    }
    
    const conversation = await Conversation.findOrCreateConversation(req.user._id, receiverId);
    
    res.json({
      success: true,
      data: {
        conversation
      }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// Get conversation messages
router.get('/conversations/:conversationId/messages', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Check if user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    const messages = await Message.getConversationMessages(conversationId, page, limit);
    
    // Mark messages as read
    await conversation.markAsRead(req.user._id);
    
    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

// Send message
router.post('/messages', authenticateToken, messageUpload.single('media'), validateMessageCreation, handleUploadError, async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;
    
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }
    
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }
    
    // Validate content based on message type
    if (type === 'text' && !content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required for text messages'
      });
    }
    
    if (['image', 'video', 'audio', 'file'].includes(type) && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Media file is required for this message type'
      });
    }
    
    // Find or create conversation
    const conversation = await Conversation.findOrCreateConversation(req.user._id, receiverId);
    
    // Create message
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content: content || '',
      type,
      mediaUrl: req.file ? req.file.path : null,
      conversation: conversation._id
    });
    
    await message.save();
    
    // Update conversation with last message
    await conversation.updateLastMessage(message._id, req.user._id);
    
    // Populate message data
    await message.populate('sender', 'username displayName avatar isOnline');
    await message.populate('receiver', 'username displayName avatar isOnline');
    
    // Emit real-time message to receiver
    const io = req.app.get('io');
    io.to(receiverId).emit('new_message', {
      message: message.getMessageData(),
      conversation: conversation.getConversationData()
    });
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Mark message as read
router.put('/messages/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is the receiver
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }
    
    const wasRead = message.markAsRead();
    await message.save();
    
    // Update conversation unread count
    const conversation = await Conversation.findById(message.conversation);
    if (conversation) {
      await conversation.markAsRead(req.user._id);
    }
    
    res.json({
      success: true,
      message: wasRead ? 'Message marked as read' : 'Message was already read',
      data: {
        isRead: message.isRead,
        readAt: message.readAt
      }
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// Delete message
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    });
    
    let totalUnread = 0;
    conversations.forEach(conversation => {
      const unreadCount = conversation.unreadCount.get(req.user._id.toString()) || 0;
      totalUnread += unreadCount;
    });
    
    res.json({
      success: true,
      data: {
        unreadCount: totalUnread
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

// Mark all messages as read for a conversation
router.put('/conversations/:conversationId/read-all', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    // Mark all messages as read
    await Message.updateMany(
      { 
        conversation: conversationId,
        receiver: req.user._id,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    
    // Update conversation unread count
    await conversation.markAsRead(req.user._id);
    
    res.json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    console.error('Mark all messages read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all messages as read'
    });
  }
});

module.exports = router;





