const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.type === 'text';
    },
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    required: function() {
      return ['image', 'video', 'audio', 'file'].includes(this.type);
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return true;
  }
  return false;
};

// Method to get message data
messageSchema.methods.getMessageData = function() {
  return {
    id: this._id,
    sender: this.sender,
    receiver: this.receiver,
    content: this.content,
    type: this.type,
    mediaUrl: this.mediaUrl,
    isRead: this.isRead,
    readAt: this.readAt,
    conversation: this.conversation,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get conversation messages
messageSchema.statics.getConversationMessages = function(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ conversation: conversationId })
    .populate('sender', 'username displayName avatar isOnline')
    .populate('receiver', 'username displayName avatar isOnline')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Message', messageSchema);





