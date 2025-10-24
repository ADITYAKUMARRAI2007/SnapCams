# 📸 SnapCams / SnapCap — Full-Stack AI-Powered Social Media Platform

> A next-generation, camera-first social app that merges AI creativity, real-time storytelling, and seamless cloud integration.

SnapCams (SnapCap) is a complete social media prototype inspired by Snapchat and Instagram. It allows users to capture ephemeral stories, post content, chat in real time, and auto-generate AI captions using Google Gemini. Built using React + Vite on the frontend and Express + MongoDB + Socket.IO on the backend.

================================================================================

================================================================================

🧠 TECHNOLOGY STACK

Frontend: React (TypeScript), Vite, TailwindCSS, Mapbox  
Backend: Node.js, Express.js, MongoDB (Mongoose)  
Realtime: Socket.IO  
AI Layer: Google Gemini API  
Storage: Cloudinary  
Security: Helmet, CORS, JWT, express-rate-limit  
Deployment: Render (Backend) + Netlify/Vercel (Frontend)

================================================================================

================================================================================

📂 PROJECT STRUCTURE

SnapCams/
├── src/                         # Frontend (React + Vite)
│   ├── components/              # Camera, Map, Feed, etc.
│   ├── services/api.ts          # API Client
│   ├── App.tsx / main.tsx       # Root Application
│   └── assets/                  # Media and Icons
│
├── snapcap-backend/             # Backend (Express)
│   ├── src/models/              # MongoDB Models
│   ├── src/routes/              # API Routes
│   ├── src/services/            # Cloudinary, Gemini AI
│   ├── src/middleware/          # Validation & Upload
│   ├── src/socket/              # Socket.IO Events
│   ├── server.js                # Express Entry
│   └── seedDatabase.js          # Demo Data Seeder
│
├── .env.example                 # Frontend Env Example
├── snapcap-backend/.env.example # Backend Env Example
└── README.md                    # Documentation

================================================================================
⚙️ SETUP & INSTALLATION
================================================================================

1️⃣ CLONE THE REPO
git clone https://github.com/ADITYAKUMARRAI2007/SnapCams.git
cd SnapCams

2️⃣ BACKEND SETUP
cd snapcap-backend
cp .env.example .env
# Update .env with MONGODB_URI, CLOUDINARY, and JWT keys
npm install
npm run dev
# Runs on http://localhost:5001
curl http://localhost:5001/health

3️⃣ FRONTEND SETUP
cd ..
npm install
npm run dev
# Frontend: http://localhost:3000

================================================================================

================================================================================

🧩 API DOCUMENTATION

--- AUTHENTICATION ---
POST   /api/auth/register           → Register user  
POST   /api/auth/login              → Login user  
POST   /api/auth/logout             → Logout  
POST   /api/auth/refresh-token      → Refresh token  
GET    /api/auth/me                 → Current user  
GET    /api/auth/verify             → Verify token  

--- USERS ---
GET    /api/users/profile           → Get profile  
PUT    /api/users/profile           → Update profile  
POST   /api/users/avatar            → Upload avatar  
GET    /api/users/:username         → Get user by username  
GET    /api/users/:username/posts   → User posts  
GET    /api/users/:username/followers → Followers  
GET    /api/users/:username/following → Following  
POST   /api/users/:userId/follow    → Follow/unfollow  
GET    /api/users/search            → Search users  

--- POSTS ---
GET    /api/posts                   → Feed posts  
POST   /api/posts                   → Create post  
GET    /api/posts/:postId           → Single post  
PUT    /api/posts/:postId           → Update post  
DELETE /api/posts/:postId           → Delete post  
POST   /api/posts/:postId/like      → Like/unlike  
POST   /api/posts/:postId/save      → Save/unsave  
POST   /api/posts/:postId/share     → Share post  
GET    /api/posts/:postId/comments  → Post comments  
GET    /api/posts/trending          → Trending posts  
GET    /api/posts/explore           → Explore posts  
POST   /api/posts/generate-caption  → AI Caption (GeminiService)

--- STORIES ---
GET    /api/stories                 → All active stories  
POST   /api/stories                 → Create story  
GET    /api/stories/:storyId        → Get story  
POST   /api/stories/:storyId/view   → Mark viewed  
DELETE /api/stories/:storyId        → Delete story  
GET    /api/stories/user/:userId    → User stories  
POST   /api/stories/:storyId/content → Add media  

--- COMMENTS ---
GET    /api/comments/post/:postId   → Get comments  
POST   /api/comments/post/:postId   → Add comment  
GET    /api/comments/:commentId     → Get comment  
PUT    /api/comments/:commentId     → Update comment  
DELETE /api/comments/:commentId     → Delete comment  
POST   /api/comments/:commentId/like → Like/unlike  
POST   /api/comments/:commentId/pin  → Pin/unpin  
GET    /api/comments/:commentId/replies → Get replies  

--- DUETS ---
GET    /api/duets                   → All duets  
POST   /api/duets/post/:postId      → Create duet  
GET    /api/duets/:duetId           → Get duet  
PUT    /api/duets/:duetId           → Update duet  
DELETE /api/duets/:duetId           → Delete duet  
POST   /api/duets/:duetId/like      → Like/unlike  
GET    /api/duets/user/:userId      → User duets  

--- CHAT ---
GET    /api/chat/conversations      → User chats  
POST   /api/chat/conversations      → Start chat  
GET    /api/chat/conversations/:conversationId/messages → Get messages  
POST   /api/chat/messages           → Send message  
PUT    /api/chat/messages/:messageId/read → Mark read  
DELETE /api/chat/messages/:messageId → Delete message  
GET    /api/chat/unread-count       → Unread messages  
PUT    /api/chat/conversations/:conversationId/read-all → Read all  

--- NOTIFICATIONS ---
GET    /api/notifications           → Get notifications  
GET    /api/notifications/:notificationId → Get notification  
PUT    /api/notifications/:notificationId/read → Mark read  
PUT    /api/notifications/read-all  → Mark all read  
DELETE /api/notifications/:notificationId → Delete  
GET    /api/notifications/unread-count → Count  
GET    /api/notifications/type/:type → Filter  

--- SEARCH ---
GET /api/search/users               → Search users  
GET /api/search/posts               → Search posts  
GET /api/search/hashtags            → Search hashtags  
GET /api/search/trending/hashtags   → Trending hashtags  
GET /api/search/hashtag/:hashtag    → Hashtag posts  
GET /api/search/global              → Global search  

================================================================================

================================================================================

🔌 SOCKET.IO EVENTS

CLIENT → SERVER  
join_conversation  {conversationId}  
typing_start       {conversationId, receiverId}  
typing_stop        {conversationId, receiverId}  
message_sent       {conversationId, receiverId, message}  
post_liked         {postId, postAuthorId}  
user_followed      {followedUserId}  
story_viewed       {storyId, storyAuthorId}  

SERVER → CLIENT  
user_online        {userId}  
user_offline       {userId}  
new_message        {message, conversation}  
user_typing        {userId, username}  
new_notification   {type, fromUser}  

================================================================================

================================================================================

🧠 AI CAPTION FLOW

Frontend → apiService.generateCaption() sends image & metadata (mood, location)  
Backend  → /api/posts/generate-caption handled by GeminiService.js  
Gemini AI → Returns generated caption + hashtags  
Frontend → Displays and allows “Regenerate Caption”  

================================================================================

================================================================================

🧪 SEEDING DEMO DATA

cd snapcap-backend  
node seedDatabase.js  
# Generates demo users, stories, chats, and posts  

================================================================================

================================================================================

🔒 SECURITY FEATURES

✔ JWT access + refresh tokens  
✔ Helmet.js security headers  
✔ express-rate-limit for spam control  
✔ bcrypt password encryption  
✔ Input validation (express-validator)  
✔ Centralized error handler  
✔ CORS whitelist protection  

================================================================================

================================================================================

🚀 DEPLOYMENT

--- BACKEND (Render) ---
git push render main  
# Live: https://snapcap-backend.onrender.com  

--- FRONTEND (Netlify / Vercel) ---
npm run build  
# Deploy dist/ folder  
# Live: https://snapcams.netlify.app  

================================================================================

================================================================================

🧰 USEFUL COMMANDS

npm run dev           → Run development  
npm start             → Run production  
npm run build         → Build frontend  
node seedDatabase.js  → Seed demo data  

================================================================================

================================================================================

🤝 CONTRIBUTING

1. Fork this repository  
2. Create a feature branch (feature/your-feature)  
3. Commit changes with clear messages  
4. Open a Pull Request  

================================================================================

================================================================================

🧾 LICENSE

Licensed under the ISC License © 2025 SnapCap Project  

================================================================================

================================================================================

💛 CREDITS & SUPPORT

Developed by Aditya Kumar Rai  
📧 adityarai040107@gmail.com 
🐙 GitHub: https://github.com/ADITYAKUMARRAI2007  
“Built for creators. Powered by AI. Connected in real time.” 🚀
EOF
