# SnapCap Backend API

A comprehensive backend API for the SnapCap social media application built with Express.js, MongoDB, and Socket.IO.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with refresh tokens
- **User Management** - Profile management, follow/unfollow system
- **Posts** - Create, like, comment, share posts with images/videos
- **Stories** - 24-hour expiring stories with multiple content types
- **Comments** - Nested comments with replies and likes
- **Duets** - Create duet responses to posts
- **Real-time Chat** - Socket.IO powered messaging system
- **Notifications** - Real-time notifications for all interactions
- **Search** - Global search across users, posts, and hashtags
- **File Upload** - Cloudinary integration for media storage

### Advanced Features
- **Real-time Updates** - Socket.IO for live notifications and chat
- **Rate Limiting** - API rate limiting for security
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Centralized error handling
- **Security** - Helmet.js security headers, CORS protection
- **Database Indexing** - Optimized MongoDB queries

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for file storage)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd snapcap-backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/snapcap

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh-token` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify` | Verify token |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |
| POST | `/api/users/avatar` | Upload avatar |
| GET | `/api/users/:username` | Get user by username |
| GET | `/api/users/:username/posts` | Get user posts |
| GET | `/api/users/:username/stories` | Get user stories |
| GET | `/api/users/:username/followers` | Get user followers |
| GET | `/api/users/:username/following` | Get user following |
| POST | `/api/users/:userId/follow` | Follow/unfollow user |
| GET | `/api/users/search` | Search users |

### Post Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get feed posts |
| POST | `/api/posts` | Create new post |
| GET | `/api/posts/:postId` | Get specific post |
| PUT | `/api/posts/:postId` | Update post |
| DELETE | `/api/posts/:postId` | Delete post |
| POST | `/api/posts/:postId/like` | Like/unlike post |
| POST | `/api/posts/:postId/save` | Save/unsave post |
| POST | `/api/posts/:postId/share` | Share post |
| GET | `/api/posts/:postId/comments` | Get post comments |
| GET | `/api/posts/trending` | Get trending posts |
| GET | `/api/posts/explore` | Get explore posts |

### Story Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories` | Get active stories |
| POST | `/api/stories` | Create new story |
| GET | `/api/stories/:storyId` | Get specific story |
| POST | `/api/stories/:storyId/view` | Mark story as viewed |
| DELETE | `/api/stories/:storyId` | Delete story |
| GET | `/api/stories/user/:userId` | Get user stories |
| POST | `/api/stories/:storyId/content` | Add content to story |

### Comment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/post/:postId` | Get post comments |
| POST | `/api/comments/post/:postId` | Create comment |
| GET | `/api/comments/:commentId` | Get specific comment |
| PUT | `/api/comments/:commentId` | Update comment |
| DELETE | `/api/comments/:commentId` | Delete comment |
| POST | `/api/comments/:commentId/like` | Like/unlike comment |
| POST | `/api/comments/:commentId/pin` | Pin/unpin comment |
| GET | `/api/comments/:commentId/replies` | Get comment replies |

### Duet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/duets` | Get all duets |
| POST | `/api/duets/post/:postId` | Create duet |
| GET | `/api/duets/:duetId` | Get specific duet |
| GET | `/api/duets/post/:postId` | Get post duets |
| PUT | `/api/duets/:duetId` | Update duet |
| DELETE | `/api/duets/:duetId` | Delete duet |
| POST | `/api/duets/:duetId/like` | Like/unlike duet |
| GET | `/api/duets/user/:userId` | Get user duets |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | Get user conversations |
| POST | `/api/chat/conversations` | Start new conversation |
| GET | `/api/chat/conversations/:conversationId/messages` | Get conversation messages |
| POST | `/api/chat/messages` | Send message |
| PUT | `/api/chat/messages/:messageId/read` | Mark message as read |
| DELETE | `/api/chat/messages/:messageId` | Delete message |
| GET | `/api/chat/unread-count` | Get unread message count |
| PUT | `/api/chat/conversations/:conversationId/read-all` | Mark all messages as read |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/notifications/:notificationId` | Get specific notification |
| PUT | `/api/notifications/:notificationId/read` | Mark notification as read |
| PUT | `/api/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/notifications/:notificationId` | Delete notification |
| GET | `/api/notifications/unread-count` | Get unread notification count |
| GET | `/api/notifications/type/:type` | Get notifications by type |

### Search Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/users` | Search users |
| GET | `/api/search/posts` | Search posts |
| GET | `/api/search/hashtags` | Search hashtags |
| GET | `/api/search/trending/hashtags` | Get trending hashtags |
| GET | `/api/search/hashtag/:hashtag` | Get posts by hashtag |
| GET | `/api/search/global` | Global search |

## 🔌 Socket.IO Events

### Client to Server Events

| Event | Description | Data |
|-------|-------------|------|
| `join_conversation` | Join conversation room | `{ conversationId }` |
| `leave_conversation` | Leave conversation room | `{ conversationId }` |
| `typing_start` | Start typing indicator | `{ conversationId, receiverId }` |
| `typing_stop` | Stop typing indicator | `{ conversationId, receiverId }` |
| `post_liked` | Post liked | `{ postId, postAuthorId }` |
| `post_commented` | Post commented | `{ postId, postAuthorId, commentId }` |
| `user_followed` | User followed | `{ followedUserId }` |
| `story_viewed` | Story viewed | `{ storyId, storyAuthorId }` |
| `duet_created` | Duet created | `{ originalPostId, originalPostAuthorId, duetId }` |
| `message_sent` | Message sent | `{ conversationId, receiverId, messageId }` |
| `user_mentioned` | User mentioned | `{ mentionedUserId, postId, commentId }` |

### Server to Client Events

| Event | Description | Data |
|-------|-------------|------|
| `user_online` | User came online | `{ userId, username, isOnline }` |
| `user_offline` | User went offline | `{ userId, username, isOnline }` |
| `new_message` | New message received | `{ message, conversation }` |
| `user_typing` | User typing indicator | `{ userId, username, isTyping }` |
| `new_notification` | New notification | `{ type, fromUser, message, ... }` |

## 🗄️ Database Models

### User Model
- Basic profile information
- Authentication data
- Follow relationships
- Settings and preferences

### Post Model
- Content and media
- Engagement metrics
- Location data
- Privacy settings

### Story Model
- Multiple content items
- Expiration handling
- View tracking
- Media overlays

### Comment Model
- Nested replies
- Like system
- Pin functionality

### Duet Model
- Original post reference
- Response content
- Engagement tracking

### Message Model
- Real-time messaging
- Media support
- Read receipts

### Conversation Model
- Participant management
- Unread counts
- Last message tracking

### Notification Model
- Multiple notification types
- Read status
- Real-time delivery

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Cross-origin request security
- **Helmet.js** - Security headers
- **Password Hashing** - bcrypt password encryption
- **File Upload Security** - Secure file handling

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snapcap
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=https://your-frontend-domain.com
```

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set other variables

# Deploy
git push heroku main
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Happy Coding! 🚀**





