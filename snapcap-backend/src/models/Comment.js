const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ isPinned: -1, createdAt: -1 });

// Virtual for likes count
commentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for replies count
commentSchema.virtual('repliesCount').get(function() {
  return this.replies.length;
});

// Method to check if user liked the comment
commentSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Method to toggle like
commentSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    return false; // Unliked
  } else {
    this.likes.push(userId);
    return true; // Liked
  }
};

// Method to get comment data
commentSchema.methods.getCommentData = function() {
  return {
    id: this._id,
    post: this.post,
    author: this.author,
    content: this.content,
    likes: this.likes,
    likesCount: this.likesCount,
    replies: this.replies,
    repliesCount: this.repliesCount,
    isPinned: this.isPinned,
    parentComment: this.parentComment,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get comments for a post
commentSchema.statics.getPostComments = function(postId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ post: postId, parentComment: null })
    .populate('author', 'username displayName avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username displayName avatar'
      }
    })
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Comment', commentSchema);





