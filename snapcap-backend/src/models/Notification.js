const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'mention', 'story_view', 'duet', 'message'],
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    default: null
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  duet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duet',
    default: null
  },
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  messageText: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return true;
  }
  return false;
};

// Method to get notification data
notificationSchema.methods.getNotificationData = function() {
  return {
    id: this._id,
    user: this.user,
    type: this.type,
    fromUser: this.fromUser,
    post: this.post,
    story: this.story,
    comment: this.comment,
    duet: this.duet,
    message: this.message,
    messageText: this.messageText,
    isRead: this.isRead,
    readAt: this.readAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const {
    user,
    type,
    fromUser,
    post = null,
    story = null,
    comment = null,
    duet = null,
    message = null,
    messageText
  } = data;

  // Don't create notification if user is trying to notify themselves
  if (user.toString() === fromUser.toString()) {
    return null;
  }

  // Check if similar notification already exists recently (within 1 hour)
  const existingNotification = await this.findOne({
    user,
    type,
    fromUser,
    post,
    story,
    comment,
    duet,
    message,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
  });

  if (existingNotification) {
    return existingNotification;
  }

  const notification = new this({
    user,
    type,
    fromUser,
    post,
    story,
    comment,
    duet,
    message,
    messageText
  });

  return await notification.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .populate('fromUser', 'username displayName avatar')
    .populate('post', 'image caption')
    .populate('story', 'content')
    .populate('comment', 'content')
    .populate('duet', 'response')
    .populate('message', 'content type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark all notifications as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
