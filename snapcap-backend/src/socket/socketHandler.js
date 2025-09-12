const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');

const socketHandler = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected with socket ID: ${socket.id}`);
    
    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });
    
    // Join user to their personal room
    socket.join(socket.userId);
    
    // Join user to rooms of people they follow (for real-time updates)
    const user = await User.findById(socket.userId).populate('following');
    user.following.forEach(followedUser => {
      socket.join(`user_${followedUser._id}`);
    });
    
    // Emit user online status to followers
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.user.username,
      isOnline: true
    });

    // Handle joining conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.username} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.user.username} left conversation ${conversationId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId, receiverId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId, receiverId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping: false
      });
    });

    // Handle post likes
    socket.on('post_liked', async (data) => {
      const { postId, postAuthorId } = data;
      
      // Don't notify if user liked their own post
      if (postAuthorId !== socket.userId) {
        // Create notification
        await Notification.createNotification({
          user: postAuthorId,
          type: 'like',
          fromUser: socket.userId,
          post: postId,
          messageText: `${socket.user.username} liked your post`
        });
        
        // Emit notification to post author
        io.to(postAuthorId).emit('new_notification', {
          type: 'like',
          fromUser: {
            id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          postId,
          message: `${socket.user.username} liked your post`
        });
      }
    });

    // Handle post comments
    socket.on('post_commented', async (data) => {
      const { postId, postAuthorId, commentId } = data;
      
      // Don't notify if user commented on their own post
      if (postAuthorId !== socket.userId) {
        // Create notification
        await Notification.createNotification({
          user: postAuthorId,
          type: 'comment',
          fromUser: socket.userId,
          post: postId,
          comment: commentId,
          messageText: `${socket.user.username} commented on your post`
        });
        
        // Emit notification to post author
        io.to(postAuthorId).emit('new_notification', {
          type: 'comment',
          fromUser: {
            id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          postId,
          commentId,
          message: `${socket.user.username} commented on your post`
        });
      }
    });

    // Handle new followers
    socket.on('user_followed', async (data) => {
      const { followedUserId } = data;
      
      // Create notification
      await Notification.createNotification({
        user: followedUserId,
        type: 'follow',
        fromUser: socket.userId,
        messageText: `${socket.user.username} started following you`
      });
      
      // Emit notification to followed user
      io.to(followedUserId).emit('new_notification', {
        type: 'follow',
        fromUser: {
          id: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        message: `${socket.user.username} started following you`
      });
    });

    // Handle story views
    socket.on('story_viewed', async (data) => {
      const { storyId, storyAuthorId } = data;
      
      // Don't notify if user viewed their own story
      if (storyAuthorId !== socket.userId) {
        // Create notification
        await Notification.createNotification({
          user: storyAuthorId,
          type: 'story_view',
          fromUser: socket.userId,
          story: storyId,
          messageText: `${socket.user.username} viewed your story`
        });
        
        // Emit notification to story author
        io.to(storyAuthorId).emit('new_notification', {
          type: 'story_view',
          fromUser: {
            id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          storyId,
          message: `${socket.user.username} viewed your story`
        });
      }
    });

    // Handle duet creation
    socket.on('duet_created', async (data) => {
      const { originalPostId, originalPostAuthorId, duetId } = data;
      
      // Don't notify if user created duet of their own post
      if (originalPostAuthorId !== socket.userId) {
        // Create notification
        await Notification.createNotification({
          user: originalPostAuthorId,
          type: 'duet',
          fromUser: socket.userId,
          post: originalPostId,
          duet: duetId,
          messageText: `${socket.user.username} created a duet of your post`
        });
        
        // Emit notification to original post author
        io.to(originalPostAuthorId).emit('new_notification', {
          type: 'duet',
          fromUser: {
            id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          postId: originalPostId,
          duetId,
          message: `${socket.user.username} created a duet of your post`
        });
      }
    });

    // Handle new messages
    socket.on('message_sent', async (data) => {
      const { conversationId, receiverId, messageId } = data;
      
      // Create notification
      await Notification.createNotification({
        user: receiverId,
        type: 'message',
        fromUser: socket.userId,
        message: messageId,
        messageText: `${socket.user.username} sent you a message`
      });
      
      // Emit notification to receiver
      io.to(receiverId).emit('new_notification', {
        type: 'message',
        fromUser: {
          id: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar
        },
        messageId,
        message: `${socket.user.username} sent you a message`
      });
    });

    // Handle user mentions
    socket.on('user_mentioned', async (data) => {
      const { mentionedUserId, postId, commentId } = data;
      
      // Don't notify if user mentioned themselves
      if (mentionedUserId !== socket.userId) {
        // Create notification
        await Notification.createNotification({
          user: mentionedUserId,
          type: 'mention',
          fromUser: socket.userId,
          post: postId,
          comment: commentId,
          message: `${socket.user.username} mentioned you`
        });
        
        // Emit notification to mentioned user
        io.to(mentionedUserId).emit('new_notification', {
          type: 'mention',
          fromUser: {
            id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          postId,
          commentId,
          message: `${socket.user.username} mentioned you`
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user?.username || 'Unknown'} disconnected`);
      
      try {
        // Update user offline status only if we have a valid connection
        if (socket.userId && mongoose.connection.readyState === 1) {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
          });
        }
        
        // Emit user offline status to followers
        if (socket.userId) {
          socket.broadcast.emit('user_offline', {
            userId: socket.userId,
            username: socket.user?.username || 'Unknown',
            isOnline: false
          });
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Handle connection errors
  io.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
};

module.exports = socketHandler;
