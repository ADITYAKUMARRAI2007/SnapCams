# SnapCap - AI-Powered Social Inspiration App

> Transform every photo into a captioned memory with auto-generated hashtags. Drop pins on a map, build streaks, and create story-like journals with collaborative Caption Duets.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn** or **pnpm**

### Option 1: One-Click Launch (Recommended)

**Windows:**
```bash
# Double-click launch.bat or run in Command Prompt:
launch.bat
```

**Unix/Linux/macOS:**
```bash
# Make executable and run:
chmod +x launch.sh
./launch.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Setup environment:**
   ```bash
   npm run setup
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## ✨ Features

### Core Features
- 📱 **Professional Social Feed** - Instagram-like interface with modern design
- 🗺️ **Interactive Map View** - Pin memories with location-based discovery
- 📸 **AI-Powered Camera** - Auto-generate captions and hashtags
- 🎭 **Caption Duets** - Collaborative poetry responses to posts
- 📚 **Story Journals** - Daily posts automatically convert to stories
- 🔥 **Streak System** - Build momentum with consistent posting
- 💬 **Real-time Chat** - Connect with friends and followers
- 👤 **Profile Management** - Complete user profile system

### Advanced Features
- 🌊 **Liquid Ether Backgrounds** - Dynamic, screen-specific animations
- 🔍 **Advanced Search & Discovery** - Find content and users
- 📊 **Analytics Dashboard** - Track engagement and growth
- 🎨 **Customizable Themes** - Personalize your experience
- 🔄 **Share System** - Cross-platform sharing capabilities
- 📱 **PWA Support** - Install as a mobile app

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **Motion (Framer Motion)** - Smooth animations
- **Lucide React** - Beautiful icons

### UI Components
- **Radix UI** - Accessible component primitives
- **Shadcn/UI** - High-quality component library
- **Custom Components** - Tailored for SnapCap experience

### State Management
- **React Hooks** - Built-in state management
- **Local Storage** - Persistent data storage
- **Context API** - Global state when needed

## 📁 Project Structure

```
snapcap/
├── src/                    # Source code
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── components/            # React components
│   ├── ui/               # Reusable UI components (Shadcn)
│   ├── figma/            # Figma integration components
│   ├── AuthView.tsx      # Authentication screen
│   ├── FeedView.tsx      # Social feed
│   ├── MapView.tsx       # Interactive map
│   ├── CameraView.tsx    # Camera interface
│   ├── ProfileView.tsx   # User profiles
│   ├── ChatView.tsx      # Messaging system
│   └── ...               # Other view components
├── styles/               # Global styles and Tailwind config
├── public/               # Static assets
├── scripts/              # Build and setup scripts
├── types/                # TypeScript type definitions
└── tools/                # Development tools
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Google Maps Integration (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Unsplash Integration (Optional)
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Demo Mode (Shows placeholder data)
VITE_DEMO_MODE=true

# App Configuration
VITE_APP_URL=http://localhost:3000
```

### API Keys Setup

1. **Google Maps API** (Optional - for enhanced maps):
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API
   - Create API key
   - Add to `.env.local`

2. **Unsplash API** (Optional - for stock photos):
   - Visit [Unsplash Developers](https://unsplash.com/developers)
   - Create application
   - Get access key
   - Add to `.env.local`

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Setup
npm run setup        # Run setup script
npm run postinstall  # Auto-run after npm install
```

### Development Guidelines

1. **Component Structure** - Each component in its own file
2. **TypeScript** - Strict typing for all components
3. **Tailwind Classes** - Use utility classes for styling
4. **Responsive Design** - Mobile-first approach
5. **Accessibility** - WCAG 2.1 compliance with Radix UI

### Adding New Components

1. Create component in `components/` directory
2. Export from component file
3. Import in parent component
4. Add TypeScript interfaces for props

## 📱 Features Deep Dive

### Social Feed
- **Instagram-inspired design** with professional aesthetics
- **Story rings** around profile pictures for active stories
- **Engagement metrics** (likes, comments, shares, duets)
- **Infinite scroll** with smooth loading
- **Real-time updates** for social interactions

### Map Integration
- **Custom pin system** for location-based memories
- **Snapchat-style map** with user-generated content
- **Location discovery** to find nearby posts
- **Streak tracking** with visual indicators
- **Privacy controls** for location sharing

### Camera & AI
- **Real-time preview** with professional filters
- **AI caption generation** using advanced algorithms
- **Smart hashtag suggestions** based on image content
- **Story mode** for ephemeral content
- **Batch upload** capabilities

### Chat System
- **Real-time messaging** between users
- **Group conversations** with multiple participants
- **Media sharing** (photos, videos, links)
- **Message reactions** and read receipts
- **Online status** indicators

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production build ready for deployment.

### Deployment Platforms

- **Vercel** - Automatic deployments from Git
- **Netlify** - Static site hosting with CI/CD
- **GitHub Pages** - Free hosting for static sites
- **Firebase Hosting** - Google's hosting platform
- **Custom Server** - Any static file server

### Environment Setup for Production

1. Set production environment variables
2. Configure domain and HTTPS
3. Enable PWA features
4. Set up analytics (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup for Contributors

```bash
# Clone repository
git clone https://github.com/yourusername/snapcap.git
cd snapcap

# Install dependencies
npm install

# Setup environment
npm run setup

# Start development
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Figma** for design inspiration and component imports
- **Unsplash** for beautiful stock photography
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Motion** for smooth animations
- **Lucide** for beautiful icons

## 📞 Support

- 📧 Email: support@snapcap.app
- 💬 Discord: [Join our community](https://discord.gg/snapcap)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/snapcap/issues)
- 📖 Docs: [Documentation](https://docs.snapcap.app)

---

**Made with ❤️ for the creative community**