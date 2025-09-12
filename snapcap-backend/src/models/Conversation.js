const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ isActive: 1 });

// Ensure participants array has exactly 2 users
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }
  next();
});

// Method to get other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(participant => 
    participant.toString() !== userId.toString()
  );
};

// Method to update last message
conversationSchema.methods.updateLastMessage = function(messageId, senderId) {
  this.lastMessage = messageId;
  this.lastMessageAt = new Date();
  
  // Update unread count for the receiver
  const receiverId = this.getOtherParticipant(senderId);
  if (receiverId) {
    const currentCount = this.unreadCount.get(receiverId.toString()) || 0;
    this.unreadCount.set(receiverId.toString(), currentCount + 1);
  }
  
  return this.save();
};

// Method to mark messages as read
conversationSchema.methods.markAsRead = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Method to get conversation data
conversationSchema.methods.getConversationData = function() {
  return {
    id: this._id,
    participants: this.participants,
    lastMessage: this.lastMessage,
    lastMessageAt: this.lastMessageAt,
    isActive: this.isActive,
    unreadCount: Object.fromEntries(this.unreadCount),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreateConversation = async function(user1Id, user2Id) {
  // Check if conversation already exists
  let conversation = await this.findOne({
    participants: { $all: [user1Id, user2Id] },
    isActive: true
  }).populate('participants', 'username displayName avatar isOnline')
    .populate('lastMessage');

  if (!conversation) {
    // Create new conversation
    conversation = new this({
      participants: [user1Id, user2Id],
      unreadCount: new Map([
        [user1Id.toString(), 0],
        [user2Id.toString(), 0]
      ])
    });
    
    await conversation.save();
    
    // Populate the new conversation
    conversation = await this.findById(conversation._id)
      .populate('participants', 'username displayName avatar isOnline')
      .populate('lastMessage');
  }

  return conversation;
};

// Static method to get user conversations
conversationSchema.statics.getUserConversations = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    participants: userId,
    isActive: true
  })
  .populate('participants', 'username displayName avatar isOnline')
  .populate('lastMessage')
  .sort({ lastMessageAt: -1 })
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Conversation', conversationSchema);





