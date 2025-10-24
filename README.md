cat > README.md <<'EOF'
# 📸 SnapCams / SnapCap — Full-Stack AI-Powered Social Media Platform

> A next-generation camera-first social media app that combines AI-driven creativity, real-time sharing, and cloud-backed scalability.

SnapCams (SnapCap) is a complete social network prototype inspired by Snapchat and Instagram. It enables users to capture stories, share posts, chat in real time, and auto-generate captions using AI. Built with React + Vite on the frontend and Express + MongoDB + Socket.IO on the backend.

================================================================================
🧠 TECHNOLOGY STACK
================================================================================
Frontend: React (TypeScript), Vite, TailwindCSS, Mapbox
Backend: Node.js, Express.js, MongoDB (Mongoose)
Realtime: Socket.IO
AI Layer: Google Gemini API
Storage: Cloudinary
Security: Helmet, CORS, JWT, express-rate-limit
Deployment: Render (Backend) + Netlify/Vercel (Frontend)

================================================================================
📁 PROJECT STRUCTURE
================================================================================
SnapCams/
├── src/                         # Frontend (Vite + React)
│   ├── components/              # Camera, Map, Feed, etc.
│   ├── services/api.ts          # API Client
│   ├── App.tsx / main.tsx       # Root App & Entry
│   └── assets/                  # Icons / Images
│
├── snapcap-backend/             # Backend (Express)
│   ├── src/models/              # MongoDB Models
│   ├── src/routes/              # REST API Routes
│   ├── src/services/            # Cloudinary, Gemini
│   ├── src/middleware/          # Validation & Upload
│   ├── src/socket/              # Realtime Handlers
│   ├── server.js                # Express Server
│   └── seedDatabase.js          # Seeder Script
│
├── .env.example                 # Frontend Example Env
├── snapcap-backend/.env.example # Backend Example Env
└── README.md                    # Documentation

================================================================================
⚙️ SETUP INSTRUCTIONS
================================================================================

1️⃣ CLONE THE REPO
git clone https://github.com/ADITYAKUMARRAI2007/SnapCams.git
cd SnapCams

2️⃣ BACKEND SETUP
cd snapcap-backend
cp .env.example .env
# Edit .env with your own MONGODB_URI, CLOUDINARY, and JWT keys
npm install
npm run dev
# Server will run on http://localhost:5001
curl http://localhost:5001/health

3️⃣ FRONTEND SETUP
cd ..
npm install
npm run dev
# App runs on http://localhost:3000

================================================================================
🧩 BACKEND API DOCUMENTATION
================================================================================

--- AUTHENTICATION ---
POST /api/auth/register        → Register new user
POST /api/auth/login           → Login user
POST /api/auth/logout          → Logout
POST /api/auth/refresh-token   → Refresh access token
GET  /api/auth/me              → Get current user
GET  /api/auth/verify          → Verify token

--- USER ---
GET  /api/users/profile        → Get user profile
PUT  /api/users/profile        → Update profile
POST /api/users/avatar         → Upload avatar
GET  /api/users/:username      → Get user by username
GET  /api/users/:username/posts      → User posts
GET  /api/users/:username/followers  → Followers
GET  /api/users/:username/following  → Following
POST /api/users/:userId/follow       → Follow/unfollow
GET  /api/users/search         → Search users

--- POSTS ---
GET  /api/posts                → Get feed posts
POST /api/posts                → Create post
GET  /api/posts/:postId        → Get single post
PUT  /api/posts/:postId        → Update post
DELETE /api/posts/:postId      → Delete post
POST /api/posts/:postId/like   → Like/unlike
POST /api/posts/:postId/save   → Save/unsave
POST /api/posts/:postId/share  → Share post
GET  /api/posts/:postId/comments → Get comments
GET  /api/posts/trending       → Trending posts
GET  /api/posts/explore        → Explore feed
POST /api/posts/generate-caption → AI caption generation (GeminiService)

--- STORIES ---
GET  /api/stories              → Get all active stories
POST /api/stories              → Create new story
GET  /api/stories/:storyId     → Get story details
POST /api/stories/:storyId/view → Mark viewed
DELETE /api/stories/:storyId   → Delete story
GET  /api/stories/user/:userId → Get user’s stories
POST /api/stories/:storyId/content → Add media to story

--- COMMENTS ---
GET  /api/comments/post/:postId → Get post comments
POST /api/comments/post/:postId → Add comment
GET  /api/comments/:commentId   → Get specific comment
PUT  /api/comments/:commentId   → Update comment
DELETE /api/comments/:commentId → Delete comment
POST /api/comments/:commentId/like → Like/unlike
POST /api/comments/:commentId/pin  → Pin/unpin
GET  /api/comments/:commentId/replies → Get replies

--- DUETS ---
GET  /api/duets                → Get all duets
POST /api/duets/post/:postId   → Create duet
GET  /api/duets/:duetId        → Get duet
PUT  /api/duets/:duetId        → Update duet
DELETE /api/duets/:duetId      → Delete duet
POST /api/duets/:duetId/like   → Like/unlike duet
GET  /api/duets/user/:userId   → Get user duets

--- CHAT ---
GET  /api/chat/conversations   → Get user conversations
POST /api/chat/conversations   → Start chat
GET  /api/chat/conversations/:conversationId/messages → Get messages
POST /api/chat/messages        → Send message
PUT  /api/chat/messages/:messageId/read → Mark read
DELETE /api/chat/messages/:messageId → Delete message
GET  /api/chat/unread-count    → Get unread count
PUT  /api/chat/conversations/:conversationId/read-all → Read all

--- NOTIFICATIONS ---
GET  /api/notifications                → All notifications
GET  /api/notifications/:notificationId → Specific notification
PUT  /api/notifications/:notificationId/read → Mark as read
PUT  /api/notifications/read-all       → Mark all as read
DELETE /api/notifications/:notificationId → Delete notification
GET  /api/notifications/unread-count   → Unread count
GET  /api/notifications/type/:type     → Filter by type

--- SEARCH ---
GET /api/search/users          → Search users
GET /api/search/posts          → Search posts
GET /api/search/hashtags       → Search hashtags
GET /api/search/trending/hashtags → Trending tags
GET /api/search/hashtag/:hashtag → Posts under hashtag
GET /api/search/global         → Global search

================================================================================
🔌 SOCKET.IO EVENTS
================================================================================

CLIENT → SERVER
join_conversation   { conversationId }
typing_start        { conversationId, receiverId }
typing_stop         { conversationId, receiverId }
message_sent        { conversationId, receiverId, message }
post_liked          { postId, postAuthorId }
user_followed       { followedUserId }
story_viewed        { storyId, storyAuthorId }

SERVER → CLIENT
user_online         { userId }
user_offline        { userId }
new_message         { message, conversation }
user_typing         { userId, username }
new_notification    { type, fromUser }

================================================================================
🧠 AI CAPTION FLOW
================================================================================
Frontend → apiService.generateCaption() → sends image + context (mood, location)
Backend  → /api/posts/generate-caption → GeminiService.js handles AI
Gemini API → returns caption + hashtags → frontend displays with regenerate option

================================================================================
🧪 SEEDING DEMO DATA
================================================================================
cd snapcap-backend
node seedDatabase.js
# Creates demo users, posts, stories, chats, notifications

================================================================================
🔒 SECURITY FEATURES
================================================================================
✔ JWT access & refresh tokens
✔ Helmet.js headers
✔ express-rate-limit
✔ bcrypt password hashing
✔ Input validation (express-validator)
✔ Centralized error handling
✔ CORS whitelisting for secure origins

================================================================================
🚀 DEPLOYMENT
================================================================================

--- BACKEND (Render) ---
git push render main
Backend live at: https://snapcap-backend.onrender.com

--- FRONTEND (Netlify/Vercel) ---
npm run build
Deploy dist/ folder
Frontend live at: https://snapcams.netlify.app

================================================================================
🧰 USEFUL COMMANDS
================================================================================
npm run dev         → Development mode
npm start           → Production mode
npm run build       → Build frontend
node seedDatabase.js → Seed demo data

================================================================================
🤝 CONTRIBUTING
================================================================================
1. Fork the repository
2. Create a branch (feature/your-feature)
3. Commit with clear message
4. Submit pull request

================================================================================
🧾 LICENSE
================================================================================
Licensed under ISC License © 2025 SnapCap Project

================================================================================
💛 CREDITS & SUPPORT
================================================================================
Developed by Aditya Kumar Rai
📧 yourname@example.com
🐙 GitHub: https://github.com/ADITYAKUMARRAI2007
“Built for creators. Powered by AI. Connected in real time.” 🚀
EOF
