const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: [{
    image: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot exceed 200 characters'],
      default: ''
    },
    music: {
      title: {
        type: String,
        default: ''
      },
      artist: {
        type: String,
        default: ''
      },
      preview: {
        type: String,
        default: ''
      },
      duration: {
        type: Number,
        default: 0
      }
    },
    textOverlay: {
      text: {
        type: String,
        default: ''
      },
      color: {
        type: String,
        default: '#ffffff'
      },
      position: {
        x: {
          type: Number,
          default: 50
        },
        y: {
          type: Number,
          default: 50
        }
      },
      size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });
storySchema.index({ isActive: 1 });
storySchema.index({ 'views.user': 1 });

// Virtual for views count
storySchema.virtual('viewsCount').get(function() {
  return this.views.length;
});

// Virtual for content count
storySchema.virtual('contentCount').get(function() {
  return this.content.length;
});

// Method to check if user viewed the story
storySchema.methods.isViewedBy = function(userId) {
  return this.views.some(view => view.user.toString() === userId.toString());
};

// Method to add view
storySchema.methods.addView = function(userId) {
  if (!this.isViewedBy(userId)) {
    this.views.push({
      user: userId,
      viewedAt: new Date()
    });
    return true; // New view added
  }
  return false; // Already viewed
};

// Method to get story data
storySchema.methods.getStoryData = function() {
  return {
    id: this._id,
    author: this.author,
    content: this.content,
    contentCount: this.contentCount,
    views: this.views,
    viewsCount: this.viewsCount,
    expiresAt: this.expiresAt,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get active stories
storySchema.statics.getActiveStories = function() {
  return this.find({
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('author', 'username displayName avatar isOnline');
};

// Static method to clean expired stories
storySchema.statics.cleanExpiredStories = async function() {
  return await this.updateMany(
    { expiresAt: { $lt: new Date() } },
    { isActive: false }
  );
};

module.exports = mongoose.model('Story', storySchema);





