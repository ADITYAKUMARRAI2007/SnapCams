const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  caption: {
    type: String,
    required: [true, 'Caption is required'],
    maxlength: [500, 'Caption cannot exceed 500 characters']
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  location: {
    name: {
      type: String,
      default: ''
    },
    coordinates: {
      lat: {
        type: Number,
        default: 0
      },
      lng: {
        type: Number,
        default: 0
      }
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: {
    type: Number,
    default: 0
  },
  duets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duet'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ likes: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for likes count
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Virtual for duets count
postSchema.virtual('duetsCount').get(function() {
  return this.duets.length;
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    return false; // Unliked
  } else {
    this.likes.push(userId);
    return true; // Liked
  }
};

// Method to get post with populated data
postSchema.methods.getPostData = function() {
  return {
    id: this._id,
    author: this.author,
    image: this.image,
    caption: this.caption,
    hashtags: this.hashtags,
    location: this.location,
    likes: this.likes,
    likesCount: this.likesCount,
    comments: this.comments,
    commentsCount: this.commentsCount,
    shares: this.shares,
    duets: this.duets,
    duetsCount: this.duetsCount,
    views: this.views,
    streak: this.streak,
    isPublic: this.isPublic,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Post', postSchema);





